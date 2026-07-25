import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Something went wrong</h2>
            <p className="text-sm text-neutral-600">
              An unexpected display error occurred. Please reload the page to restore your workspace session.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-medium transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
