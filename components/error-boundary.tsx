"use client"

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] text-white p-4">
          <div className="border border-[#2d3748] p-8 max-w-2xl w-full" style={{ backgroundColor: "#151922" }}>
            <h1 className="text-2xl font-bold text-[#00ff00] mb-4">Something went wrong</h1>
            <p className="text-[#a0aec0] mb-4">
              There was an error loading the application. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="text-[#00ff00] cursor-pointer">Error Details</summary>
                <pre className="text-xs text-[#a0aec0] mt-2 p-2 bg-[#0a0e1a] overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-[#00ff00] text-black px-4 py-2 font-bold hover:bg-[#00dd00] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
