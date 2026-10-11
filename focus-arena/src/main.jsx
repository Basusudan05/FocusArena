import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { TimerProvider } from './context/TimerContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <TimerProvider>
          <App />
        </TimerProvider>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
