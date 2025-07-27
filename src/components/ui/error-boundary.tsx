import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="flex flex-col items-center space-y-4 max-w-md">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Noget gik galt</h2>
              <p className="text-muted-foreground">
                Der opstod en uventet fejl. Prøv at genindlæse siden eller kontakt support, hvis problemet fortsætter.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-muted rounded-md text-left w-full">
                <summary className="cursor-pointer font-medium mb-2">
                  Fejldetaljer (kun i udvikling)
                </summary>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex space-x-2">
              <Button onClick={this.handleReset} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Prøv igen
              </Button>
              <Button onClick={() => window.location.reload()}>
                Genindlæs siden
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook-based error boundary for functional components
interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4 text-center">
      <div className="flex flex-col items-center space-y-4 max-w-sm">
        <AlertTriangle className="w-8 h-8 text-destructive" />
        <div className="space-y-2">
          <h3 className="font-semibold">Der opstod en fejl</h3>
          <p className="text-sm text-muted-foreground">
            {error.message || 'En uventet fejl opstod'}
          </p>
        </div>
        <Button onClick={resetError} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Prøv igen
        </Button>
      </div>
    </div>
  )
}