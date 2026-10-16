import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-4 text-center text-white">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-bold text-white">Что-то пошло не так</h2>
            <p className="mt-2 text-xs text-neutral-400">
              Произошла непредвиденная ошибка отображения. Нажмите кнопку ниже, чтобы перезагрузить страницу.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-neutral-950 hover:bg-neutral-100 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Обновить страницу</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
