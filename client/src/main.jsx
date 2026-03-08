import React from 'react'
import 'leaflet/dist/leaflet.css'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { store } from './store/index.js'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              1,
      refetchOnWindowFocus: false,
      staleTime:          1000 * 60 * 5, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Satoshi, sans-serif',
              fontSize:   '0.9rem',
            },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          }}
        />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
)