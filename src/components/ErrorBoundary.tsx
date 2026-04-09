"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches rendering errors and displays a fallback UI.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponentThatMightError />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("ErrorBoundary", error.message, error, {
      componentStack: info.componentStack ?? undefined,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
          <p className="text-sm font-medium">Something went wrong</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
