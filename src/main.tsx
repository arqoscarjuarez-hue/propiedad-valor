import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initGoogleTranslateFix } from './utils/googleTranslateFix'

// Aplicar fix para Google Translate inmediatamente
initGoogleTranslateFix()

createRoot(document.getElementById("root")!).render(<App />);
