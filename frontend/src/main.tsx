import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initAudio } from './utils/audio'
import { LanguageProvider } from './contexts/LanguageContext'

initAudio();

// 注册 Service Worker（PWA 离线支持）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/heritage.skill/sw.js').catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)
