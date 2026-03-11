import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase';

export interface UploadResult {
    url: string;
    path: string;
}

/**
 * Upload a file to Firebase Storage under submissions/{uid}/{filename}.
 * Returns a promise that resolves with the download URL.
 * Calls onProgress with 0-100 during upload.
 */
export async function uploadSubmissionFile(
    file: File,
    folder: 'synopsis' | 'sample',
    onProgress?: (pct: number) => void,
): Promise<UploadResult> {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Must be authenticated to upload');

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `submissions/${uid}/${folder}/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file, {
            contentType: file.type,
        });

        uploadTask.on(
            'state_changed',
            (snap) => {
                const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                onProgress?.(pct);
            },
            (error) => reject(error),
            async () => {
                try {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({ url, path: storagePath });
                } catch (err) {
                    reject(err);
                }
            },
        );
    });
}
