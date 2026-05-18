import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App';
import { firebaseServices } from '@/services/firebase/runtime';
import { initializeObservability, ObservabilityErrorBoundary } from '@/services/observability';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found.');
}

void initializeObservability(firebaseServices).finally(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <ObservabilityErrorBoundary>
        <App />
      </ObservabilityErrorBoundary>
    </StrictMode>
  );
});
