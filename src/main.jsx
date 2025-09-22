import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Modal from 'react-modal';
import { HashRouter } from 'react-router-dom'

Modal.setAppElement('#root');
createRoot(document.getElementById('root')).render(
  <HashRouter>
    <App />
  </HashRouter>,
)
