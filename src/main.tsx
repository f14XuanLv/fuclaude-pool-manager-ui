import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Styles are imported via index.html's <link> tag or could be imported here in a Vite setup
// import './index.css'; // If you move index.css to src/ and want Vite to handle it

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root container not found. Ensure you have an element with id='root' in your HTML.");
}
