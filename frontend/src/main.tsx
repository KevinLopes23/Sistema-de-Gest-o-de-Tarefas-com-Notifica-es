import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/app/store'
import { ThemeProvider } from '@/app/ThemeProvider'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </StrictMode>,
)

// Sobe a cortina do preloader (ver index.html) depois que a intro de 1.5s termina de
// tocar, revelando a página. Com prefers-reduced-motion, some na hora, sem transição.
function dismissPreloader() {
  const preloader = document.getElementById('app-preloader')
  if (!preloader) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    preloader.remove()
    return
  }

  window.setTimeout(() => {
    preloader.classList.add('pl-open')
    preloader.addEventListener('transitionend', () => preloader.remove(), { once: true })
    window.setTimeout(() => preloader.remove(), 1000)
  }, 1500)
}

dismissPreloader()
