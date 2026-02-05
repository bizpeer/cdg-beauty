import React, { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Debug Error Reporter
const ErrorBoundary = ({ children }) => {
  const [error, setError] = useState(null)

  useEffect(() => {
    const handler = (event) => {
      setError(event.error || new Error(event.message))
    }
    window.addEventListener('error', handler)
    window.addEventListener('unhandledrejection', (e) => setError(e.reason))
    return () => window.removeEventListener('error', handler)
  }, [])

  if (error) {
    return (
      <div style={{ padding: '40px', background: '#fff', color: '#000', fontFamily: 'monospace', minHeight: '100vh', border: '10px solid #E60012' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>SYSTEM CRASH DETECTED</h1>
        <p style={{ color: '#E60012', fontWeight: 'bold' }}>Please provide this error log to the developer:</p>
        <pre style={{ background: '#f5f5f5', padding: '20px', overflow: 'auto', borderLeft: '5px solid #000' }}>
          {error.stack || error.message}
        </pre>
        <button onClick={() => window.location.reload()} style={{ background: '#000', color: '#fff', padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>RETRY REFRESH</button>
      </div>
    )
  }
  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
