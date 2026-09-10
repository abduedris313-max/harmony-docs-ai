/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Harmony DocAI Error Boundary Caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#000000] text-[#F2F2F7] flex flex-col items-center justify-center p-6 text-center font-sans select-none">
          <div className="w-full max-w-md ios-card bg-[#1C1C1E]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
            {/* iOS System Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FF453A]/15 border border-[#FF453A]/30 flex items-center justify-center text-[#FF453A]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              Harmony DocAI
            </h1>
            <p className="text-sm text-[#8E8E93] mb-6 leading-relaxed">
              An issue occurred while rendering the workspace interface. You can reload the application or reset stored preferences.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-black/50 border border-white/10 rounded-xl text-left overflow-x-auto text-xs font-mono text-[#FF9F0A]">
                <p className="font-semibold mb-1">Diagnostic Details:</p>
                <p className="break-words">{this.state.error.message || String(this.state.error)}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-[#007AFF] hover:bg-[#0062CC] active:scale-95 text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#007AFF]/25"
              >
                <RefreshCw className="w-4 h-4" />
                Reload
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/15 active:scale-95 text-[#AEAEB2] hover:text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <Trash2 className="w-4 h-4" />
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
