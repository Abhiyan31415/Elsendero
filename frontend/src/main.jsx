import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ContextProvider from './context/ContextProvider.jsx'
import axios from 'axios';
import { API_URL } from './config';

// Only needed when the backend is tunnelled through ngrok (skips its browser warning page).
if (API_URL.includes('ngrok')) {
  axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContextProvider>
    <App />
    </ContextProvider>
  </StrictMode>,
)
