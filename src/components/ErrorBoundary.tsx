import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-void-black text-text-primary flex items-center justify-center p-6">
          <div className="bg-surface border border-forge-red p-8 rounded-sm max-w-2xl w-full">
            <h1 className="font-display text-2xl text-forge-red mb-4">A Cosmic Anomaly Occurred</h1>
            <p className="font-ui text-text-secondary mb-6">
              The Starforge encountered an unexpected error. Our scribes have been notified.
            </p>
            <div className="bg-deep-space p-4 rounded-sm border border-border overflow-auto max-h-64">
              <pre className="font-mono text-xs text-text-muted whitespace-pre-wrap">
                {this.state.error?.message || 'Unknown Error'}
              </pre>
            </div>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-6 px-6 py-2 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-yellow-600 transition-colors"
            >
              Attempt Re-entry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
