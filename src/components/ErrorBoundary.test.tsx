import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// ═══════════════════════════════════════════
// ErrorBoundary — Component Tests
// ═══════════════════════════════════════════

// Helper: a component that throws on demand
function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test explosion');
  }
  return <div>Everything is fine</div>;
}

// Suppress React's error boundary console noise during tests
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: any[]) => {
    if (/React will try to recreate|The above error occurred|Uncaught error/i.test(String(args[0]))) return;
    originalError(...args);
  };
});
afterEach(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('displays error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('A Cosmic Anomaly Occurred')).toBeInTheDocument();
    expect(screen.getByText('Test explosion')).toBeInTheDocument();
  });

  it('shows "Attempt Re-entry" button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Attempt Re-entry')).toBeInTheDocument();
  });

  it('resets error state when "Attempt Re-entry" is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error is showing
    expect(screen.getByText('A Cosmic Anomaly Occurred')).toBeInTheDocument();

    // Click reset
    fireEvent.click(screen.getByText('Attempt Re-entry'));

    // Re-render with non-throwing child to verify error state cleared
    rerender(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
  });
});
