// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Make sure this path correctly points to your App.js
import './App.css'; // Import your main CSS file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
