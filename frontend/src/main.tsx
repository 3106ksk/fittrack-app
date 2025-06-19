import { StrictMode } from 'react'
import { createRoot, Root } from 'react-dom/client'
import App from './App'

const rootElement: HTMLElement | null = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root: Root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

