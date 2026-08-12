import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ContextProvider from './context/ContextProvider.jsx'
import axios from 'axios';

// Add this line so ALL axios requests bypass the ngrok warning screen
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContextProvider>
    <App />
    </ContextProvider>
  </StrictMode>,
)
