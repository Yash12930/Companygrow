// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
   import { BrowserRouter as Router } from 'react-router-dom'; // Router is here
import { AuthProvider } from './context/AuthContext'; // Assuming AuthProvider is separate

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router> {/* Router wraps AuthProvider and App */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
