import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from '@/App.tsx';
import theme from '@/styles/theme'; // Import theme directly

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={theme}> {/* Use theme prop */}
      <App />
    </ChakraProvider>
  </StrictMode>,
);
