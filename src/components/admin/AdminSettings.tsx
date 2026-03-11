import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, CheckCircle, Globe, Bell, FileText, Palette, Shield, Mail, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

interface SiteSettings {
    siteName: string;
    tagline: string;
    contactEmail: string;
    supportEmail: string;
    submissionsOpen: boolean;
    maxSubmissionsPerAuthor: number;
    autoResponseEnabled: boolean;
    autoResponseText: string;
    maintenanceMode: boolean;
    analyticsId: string;
    socialTwitter: string;
    socialInstagram: string;
    socialGoodreads: string;
    theme: 'dark' | 'cosmic';
    accentColor: string;
    notifyNewSubmission: boolean;
    notifyNewUser: boolean;
    notifyNewReview: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
    siteName: 'Rüna Atlas',
    tagline: 'Charting New Worlds in Literature',
    contactEmail: 'contact@runaatlas.com',
    supportEmail: 'support@runaatlas.com',
    submissionsOpen: true,
    maxSubmissionsPerAuthor: 3,
    autoResponseEnabled: true,
    autoResponseText: 'Thank you for your submission! We will review it within 6-8 weeks.',
    maintenanceMode: false,
    analyticsId: '',
    socialTwitter: '@runaatlas',
    socialInstagram: '@runaatlas',
    socialGoodreads: '',
    theme: 'dark',
    accentColor: '#d4a017',
    notifyNewSubmission: true,
    notifyNewUser: true,
    notifyNewReview: false,
};

export default function AdminSettings() {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeSection, setActiveSection] = useState('general');

    useEffect(() => {
        (async () => {
            try {
                const snap = await getDoc(doc(db, 'siteConfig', 'settings'));
                if (snap.exists()) setSettings({ ...DEFAULT_SETTINGS, ...snap.data() } as SiteSettings);
            } catch { /* use defaults */ }
        })();
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'siteConfig', 'settings'), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch { /* ignore */ }
        setSaving(false);
    };

    const u = (field: keyof SiteSettings, value: any) => setSettings(prev => ({ ...prev, [field]: value }));

    const sections = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'submissions', label: 'Submissions', icon: FileText },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'integrations', label: 'Integrations', icon: Shield },
    ];

    const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
        <div className="flex items-center justify-between py-2">
            <span className="font-ui text-sm text-text-primary">{label}</span>
            <button onClick={() => onChange(!checked)} className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-starforge-gold' : 'bg-border'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-5.5' : 'left-0.5'}`} />
            </button>
        </div>
    );

    const Input = ({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
        <div>
            <label className="block font-ui text-xs text-text-muted uppercase tracking-wider mb-1">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">Settings</h1>
                <div className="flex items-center gap-3">
                    {saved && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 font-ui text-sm text-aurora-teal">
                            <CheckCircle className="w-4 h-4" /> Saved!
                        </motion.span>
                    )}
                    <button onClick={save} disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500 disabled:opacity-50">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Settings
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Section Nav */}
                <aside className="md:w-48 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                    {sections.map(s => (
                        <button key={s.id} onClick={() => setActiveSection(s.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-sm font-ui text-sm whitespace-nowrap transition-colors ${activeSection === s.id ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                                }`}>
                            <s.icon className="w-4 h-4" /> {s.label}
                        </button>
                    ))}
                </aside>

                {/* Content */}
                <div className="flex-1 bg-surface border border-border rounded-sm p-6">
                    {activeSection === 'general' && (
                        <div className="space-y-4">
                            <h2 className="font-heading text-lg text-text-primary mb-4">General Settings</h2>
                            <Input label="Site Name" value={settings.siteName} onChange={v => u('siteName', v)} />
                            <Input label="Tagline" value={settings.tagline} onChange={v => u('tagline', v)} />
                            <Input label="Contact Email" value={settings.contactEmail} onChange={v => u('contactEmail', v)} type="email" />
                            <Input label="Support Email" value={settings.supportEmail} onChange={v => u('supportEmail', v)} type="email" />
                            <Toggle checked={settings.maintenanceMode} onChange={v => u('maintenanceMode', v)} label="Maintenance Mode" />
                            {settings.maintenanceMode && (
                                <p className="font-ui text-xs text-forge-red bg-forge-red/10 px-3 py-2 rounded-sm">⚠️ Site is in maintenance mode. Visitors will see a maintenance page.</p>
                            )}
                        </div>
                    )}

                    {activeSection === 'submissions' && (
                        <div className="space-y-4">
                            <h2 className="font-heading text-lg text-text-primary mb-4">Submission Settings</h2>
                            <Toggle checked={settings.submissionsOpen} onChange={v => u('submissionsOpen', v)} label="Accepting Submissions" />
                            <div>
                                <label className="block font-ui text-xs text-text-muted uppercase tracking-wider mb-1">Max Submissions Per Author</label>
                                <input type="number" min={1} max={20} value={settings.maxSubmissionsPerAuthor} onChange={e => u('maxSubmissionsPerAuthor', parseInt(e.target.value) || 1)}
                                    className="w-24 bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                            </div>
                            <Toggle checked={settings.autoResponseEnabled} onChange={v => u('autoResponseEnabled', v)} label="Automatic Response Email" />
                            {settings.autoResponseEnabled && (
                                <div>
                                    <label className="block font-ui text-xs text-text-muted uppercase tracking-wider mb-1">Auto-Response Message</label>
                                    <textarea rows={3} value={settings.autoResponseText} onChange={e => u('autoResponseText', e.target.value)}
                                        className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold resize-none" />
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="space-y-4">
                            <h2 className="font-heading text-lg text-text-primary mb-4">Notification Preferences</h2>
                            <Toggle checked={settings.notifyNewSubmission} onChange={v => u('notifyNewSubmission', v)} label="New submission received" />
                            <Toggle checked={settings.notifyNewUser} onChange={v => u('notifyNewUser', v)} label="New user registered" />
                            <Toggle checked={settings.notifyNewReview} onChange={v => u('notifyNewReview', v)} label="New review posted" />
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div className="space-y-4">
                            <h2 className="font-heading text-lg text-text-primary mb-4">Appearance</h2>
                            <div>
                                <label className="block font-ui text-xs text-text-muted uppercase tracking-wider mb-2">Theme</label>
                                <div className="flex gap-2">
                                    {(['dark', 'cosmic'] as const).map(t => (
                                        <button key={t} onClick={() => u('theme', t)}
                                            className={`px-4 py-2 rounded-sm font-ui text-sm capitalize ${settings.theme === t ? 'bg-starforge-gold text-void-black' : 'bg-void-black border border-border text-text-secondary'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block font-ui text-xs text-text-muted uppercase tracking-wider mb-2">Accent Color</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={settings.accentColor} onChange={e => u('accentColor', e.target.value)} className="w-10 h-10 rounded-sm border-0 cursor-pointer" />
                                    <span className="font-mono text-sm text-text-muted">{settings.accentColor}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'integrations' && (
                        <div className="space-y-4">
                            <h2 className="font-heading text-lg text-text-primary mb-4">Integrations</h2>
                            <Input label="Google Analytics ID" value={settings.analyticsId} onChange={v => u('analyticsId', v)} placeholder="G-XXXXXXXXXX" />
                            <div className="border-t border-border pt-4 mt-4">
                                <h3 className="font-ui text-xs text-text-muted uppercase tracking-wider mb-3">Social Links</h3>
                                <div className="space-y-3">
                                    <Input label="Twitter / X" value={settings.socialTwitter} onChange={v => u('socialTwitter', v)} placeholder="@handle" />
                                    <Input label="Instagram" value={settings.socialInstagram} onChange={v => u('socialInstagram', v)} placeholder="@handle" />
                                    <Input label="Goodreads" value={settings.socialGoodreads} onChange={v => u('socialGoodreads', v)} placeholder="URL" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
