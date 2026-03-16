import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ═══════════════════════════════════════════
// ProtectedRoute — Component Tests
// ═══════════════════════════════════════════

// Mock the AuthContext
const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  // Re-export UserRole type as a no-op (just need the values at runtime)
}));

import ProtectedRoute from './ProtectedRoute';

function renderProtected(
  allowedRoles: string[],
  opts?: { fallbackPath?: string; requireAuth?: boolean }
) {
  return render(
    <MemoryRouter>
      <ProtectedRoute allowedRoles={allowedRoles as any[]} {...opts}>
        <div>Protected Content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when auth is not ready', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userRole: null,
      isAuthReady: false,
    });

    const { container } = renderProtected(['admin']);
    // Should show spinner (Star icon with animate-spin)
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('shows "Sign In Required" when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userRole: null,
      isAuthReady: true,
    });

    renderProtected(['admin']);
    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
    expect(screen.getByText('Go to Sign In')).toBeInTheDocument();
  });

  it('shows "Access Denied" when authenticated but wrong role', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'user1', email: 'user@test.com' },
      userRole: 'reader',
      isAuthReady: true,
    });

    renderProtected(['admin']);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Return Home')).toBeInTheDocument();
  });

  it('renders children when authenticated with correct role', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'admin1', email: 'admin@test.com' },
      userRole: 'admin',
      isAuthReady: true,
    });

    renderProtected(['admin']);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user has one of multiple allowed roles', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'editor1', email: 'editor@test.com' },
      userRole: 'editor',
      isAuthReady: true,
    });

    renderProtected(['editor', 'admin']);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows access when requireAuth is false and user not logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userRole: null,
      isAuthReady: true,
    });

    renderProtected(['admin'], { requireAuth: false });
    // When requireAuth=false, the auth check is skipped.
    // But role check still applies — null userRole won't match 'admin'.
    // With no user and no role, it should show the content since
    // the `user && userRole && !allowedRoles.includes(userRole)` check
    // won't trigger (user is null).
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
