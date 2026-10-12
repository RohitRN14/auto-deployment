import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1e1e2e',
          color: '#cdd6f4',
          border: '1px solid rgba(137, 180, 250, 0.2)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#a6e3a1', secondary: '#1e1e2e' },
        },
        error: {
          iconTheme: { primary: '#f38ba8', secondary: '#1e1e2e' },
        },
      }}
    />
  </React.StrictMode>
);
