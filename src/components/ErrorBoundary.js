import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 text-center">
                    <div className="glass-card p-12 max-w-lg">
                        <h1 className="text-4xl font-display font-bold text-white mb-4">Something went wrong.</h1>
                        <p className="text-white/60 mb-8">
                            We've encountered an unexpected error. Don't worry, our team has been notified.
                        </p>
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
