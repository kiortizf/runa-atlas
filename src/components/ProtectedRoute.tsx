import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Star, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    fallbackPath?: string;
    requireAuth?: boolean;
}

export default function ProtectedRoute({
    children,
    allowedRoles,
    fallbackPath,
    requireAuth = true
}: ProtectedRouteProps) {
    const { user, userRole, isAuthReady } = useAuth();

    if (!isAuthReady) {
        return (
            <div className="min-h-screen bg-void-black flex items-center justify-center">
                <Star className="w-12 h-12 text-starforge-gold animate-spin" />
            </div>
        );
    }

    // Not logged in
    if (requireAuth && !user) {
        if (fallbackPath) {
            return <Navigate to={fallbackPath} replace />;
        }
        return (
            <div className="min-h-screen bg-void-black flex flex-col items-center justify-center p-6">
                <div className="bg-surface border border-border p-10 rounded-sm max-w-md w-full text-center shadow-lg">
                    <div className="w-16 h-16 bg-starforge-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-8 h-8 text-starforge-gold" />
                    </div>
                    <h1 className="font-display text-2xl text-text-primary mb-2 uppercase tracking-widest">Sign In Required</h1>
                    <p className="font-ui text-text-secondary mb-8">You need to sign in to access this page.</p>
                    <a
                        href="/portal"
                        className="inline-block w-full px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider font-semibold rounded-sm hover:bg-yellow-600 transition-colors"
                    >
                        Go to Sign In
                    </a>
                </div>
            </div>
        );
    }

    // Logged in but wrong role
    if (user && userRole && !allowedRoles.includes(userRole)) {
        return (
            <div className="min-h-screen bg-void-black flex flex-col items-center justify-center p-6">
                <div className="bg-surface border border-border p-10 rounded-sm max-w-md w-full text-center shadow-lg">
                    <div className="w-16 h-16 bg-forge-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-8 h-8 text-forge-red" />
                    </div>
                    <h1 className="font-display text-2xl text-text-primary mb-2 uppercase tracking-widest">Access Denied</h1>
                    <p className="font-ui text-text-secondary mb-8">You don't have permission to view this page.</p>
                    <a
                        href="/"
                        className="inline-block w-full px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider font-semibold rounded-sm hover:bg-yellow-600 transition-colors"
                    >
                        Return Home
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
