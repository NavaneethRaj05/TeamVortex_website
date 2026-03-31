import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 text-center">
                    <div className="glass-card p-8 max-w-lg w-full">
                        <h1 className="text-3xl font-display font-bold text-white mb-4">Something went wrong.</h1>
                        <p className="text-white/60 mb-4">
                            We've encountered an unexpected error.
                        </p>
                        {this.state.error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-left">
                                <p className="text-red-400 text-xs font-mono break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="glass-button bg-vortex-blue text-black font-bold"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
