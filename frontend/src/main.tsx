import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Let the branded launch cue finish its handoff without delaying the app shell.
const bootSplash = document.getElementById('boot-splash')
if (bootSplash) {
  window.setTimeout(() => {
    bootSplash.classList.add('is-hidden')
    window.setTimeout(() => bootSplash.remove(), 500)
  }, 1250)
}
