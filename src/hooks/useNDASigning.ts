import { useCallback, useState } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getNDAFullText, type NDATemplate } from '../data/ndaTemplates';

// ═══════════════════════════════════════════════════════════════
// useNDASigning — Cryptographic NDA Signing with Web Crypto API
// ECDSA P-256 + SHA-256 for tamper-proof, legally binding signatures
// ═══════════════════════════════════════════════════════════════

export interface NDASignatureRecord {
  id?: string;
  // Signer identity
  signerUid: string;
  signerEmail: string;
  signerDisplayName: string;
  // NDA document
  ndaType: string;
  ndaVersion: string;
  ndaTitle: string;
  // Cryptographic proof
  documentHash: string;        // SHA-256 hex of the full NDA text
  digitalSignature: string;    // ECDSA P-256 signature (base64)
  publicKey: JsonWebKey;       // JWK for independent verification
  // Signature image
  signatureImage: string;      // Base64 PNG from canvas
  // Metadata
  signedAt: any;               // serverTimestamp
  userAgent: string;
  // Legal references
  legalFramework: string[];
}

// ── SHA-256 hash using Web Crypto API ──
async function sha256Hash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Generate ECDSA P-256 key pair ──
async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true, // extractable (needed to export public key)
    ['sign', 'verify']
  );
}

// ── Sign data with ECDSA P-256 ──
async function signData(privateKey: CryptoKey, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    encoder.encode(data)
  );
  // Convert ArrayBuffer to base64
  const bytes = new Uint8Array(signature);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

// ── Export public key as JWK ──
async function exportPublicKey(publicKey: CryptoKey): Promise<JsonWebKey> {
  return await crypto.subtle.exportKey('jwk', publicKey);
}

// ── Verify a signature (for admin/audit purposes) ──
export async function verifyNDASignature(
  documentHash: string,
  signatureBase64: string,
  publicKeyJWK: JsonWebKey
): Promise<boolean> {
  try {
    // Import the public key from JWK
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      publicKeyJWK,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify']
    );

    // Decode the base64 signature
    const binaryString = atob(signatureBase64);
    const signatureBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      signatureBytes[i] = binaryString.charCodeAt(i);
    }

    // Verify
    const encoder = new TextEncoder();
    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      signatureBytes,
      encoder.encode(documentHash)
    );
  } catch {
    return false;
  }
}

export function useNDASigning() {
  const { user } = useAuth();
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState('');

  /**
   * Execute the full signing ceremony:
   * 1. Hash the NDA document text (SHA-256)
   * 2. Generate ECDSA P-256 key pair
   * 3. Sign the document hash
   * 4. Store the immutable record in Firestore
   */
  const signNDA = useCallback(async (
    renderedTemplate: NDATemplate,
    signatureImageBase64: string,
    typedName: string
  ): Promise<NDASignatureRecord | null> => {
    if (!user) {
      setSignError('You must be logged in to sign.');
      return null;
    }

    setSigning(true);
    setSignError('');

    try {
      // 1. Get full NDA text and hash it
      const fullText = getNDAFullText(renderedTemplate);
      const documentHash = await sha256Hash(fullText);

      // 2. Generate key pair
      const keyPair = await generateKeyPair();

      // 3. Sign the document hash
      const digitalSignature = await signData(keyPair.privateKey, documentHash);

      // 4. Export public key for verification
      const publicKey = await exportPublicKey(keyPair.publicKey);

      // 5. Build the signature record
      const record: Omit<NDASignatureRecord, 'id' | 'signedAt'> = {
        signerUid: user.uid,
        signerEmail: user.email || '',
        signerDisplayName: typedName,
        ndaType: renderedTemplate.id,
        ndaVersion: renderedTemplate.version,
        ndaTitle: renderedTemplate.title,
        documentHash,
        digitalSignature,
        publicKey,
        signatureImage: signatureImageBase64,
        userAgent: navigator.userAgent,
        legalFramework: [
          'ESIGN Act (15 U.S.C. §7001–7031)',
          'Uniform Electronic Transactions Act (UETA)',
          'EU eIDAS Regulation (EU No 910/2014)',
        ],
      };

      // 6. Store in Firestore (immutable — no update/delete rules)
      const docRef = await addDoc(collection(db, 'nda_signatures'), {
        ...record,
        signedAt: serverTimestamp(),
      });

      return { ...record, id: docRef.id, signedAt: new Date() };
    } catch (error) {
      console.error('NDA signing failed:', error);
      setSignError('Signing failed. Please try again.');
      handleFirestoreError(error, OperationType.WRITE, 'nda_signatures');
      return null;
    } finally {
      setSigning(false);
    }
  }, [user]);

  /**
   * Check if a user has already signed a specific NDA type + version
   */
  const checkSignatureStatus = useCallback(async (
    ndaType: string,
    ndaVersion?: string
  ): Promise<NDASignatureRecord | null> => {
    if (!user?.uid) return null;
    try {
      const q = query(
        collection(db, 'nda_signatures'),
        where('signerUid', '==', user.uid),
        where('ndaType', '==', ndaType)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;

      // Find matching version, or latest
      const records = snap.docs.map(d => ({ id: d.id, ...d.data() } as NDASignatureRecord));
      if (ndaVersion) {
        return records.find(r => r.ndaVersion === ndaVersion) || null;
      }
      return records[0]; // Latest
    } catch {
      return null;
    }
  }, [user?.uid]);

  return {
    signNDA,
    checkSignatureStatus,
    verifySignature: verifyNDASignature,
    signing,
    signError,
  };
}
