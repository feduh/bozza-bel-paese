import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Top-level React error boundary.
 *
 * Catches render-time exceptions anywhere in the tree and shows a friendly
 * recovery screen instead of a blank page. Logs to the console (and to any
 * future telemetry sink wired into `window.onerror`).
 *
 * Note: error boundaries do NOT catch errors in event handlers, async code,
 * or server-side rendering — those are handled by the global listeners
 * registered in `main.tsx`.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep a single, structured log entry for easier debugging.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    const isDev = import.meta.env.DEV;
    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center bg-background px-6 py-16"
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle size={28} aria-hidden />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold">Qualcosa è andato storto</h1>
            <p className="text-sm text-muted-foreground font-body">
              Si è verificato un errore inatteso. Puoi ricaricare o tornare alla home.
            </p>
          </div>

          {isDev && (
            <pre className="text-left text-xs bg-muted/60 p-3 rounded-md overflow-auto max-h-40 font-mono text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.reset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={14} aria-hidden /> Riprova
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              <Home size={14} aria-hidden /> Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
