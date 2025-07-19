'use client'

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service workers are not supported in this browser');
        return;
      }

      try {
        console.log('🔄 Starting service worker registration...');
        console.log('📍 Current URL:', window.location.href);
        console.log('📍 Service worker URL:', new URL('/sw.js', window.location.origin).href);

        // Check if service worker file exists
        try {
          const swResponse = await fetch('/sw.js');
          console.log('📄 Service worker file status:', swResponse.status);
          if (!swResponse.ok) {
            throw new Error(`Service worker file not found: ${swResponse.status}`);
          }
        } catch (fetchError) {
          console.error('❌ Cannot fetch service worker file:', fetchError);
          return;
        }

        // Register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('✅ Service worker registered successfully:', {
          scope: registration.scope,
          state: registration.installing ? 'installing' : 
                 registration.waiting ? 'waiting' : 
                 registration.active ? 'active' : 'unknown'
        });

        // Wait for the service worker to be ready
        console.log('🔄 Waiting for service worker to be ready...');
        const readyRegistration = await navigator.serviceWorker.ready;
        console.log('✅ Service worker is ready:', {
          scope: readyRegistration.scope,
          state: readyRegistration.active ? 'active' : 'not active'
        });

        // Check if push manager is available
        if ('pushManager' in readyRegistration) {
          console.log('✅ Push manager is available');
        } else {
          console.warn('⚠️ Push manager is not available');
        }

      } catch (error) {
        console.error('❌ Service worker registration failed:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        } else {
          console.error('Unknown error type:', typeof error);
        }
      }
    };

    // Register service worker
    registerServiceWorker();
  }, []);

  return null;
}
