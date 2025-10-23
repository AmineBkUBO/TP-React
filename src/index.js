import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

// ✅ Register the Service Worker for Push Notifications
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration.scope);

                // Listen for messages from the Service Worker
                navigator.serviceWorker.onmessage = (event) => {
                    console.log('📩 Message from SW:', event.data);

                    // Re-dispatch the message as a custom event
                    window.dispatchEvent(
                        new CustomEvent('push-notification', { detail: event.data })
                    );
                };
            })
            .catch((error) => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
}

reportWebVitals(console.log);
