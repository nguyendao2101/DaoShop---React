// src/main.jsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import './assets/styles/index.css'
import reportWebVitals from './reportWebVitals.js'
import { router } from './routes/routers.jsx'

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>,
  )
}

reportWebVitals()