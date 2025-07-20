'use client'

import { useEffect } from 'react'

export default function TestPush() {
  useEffect(() => {
    // Define the test function
    (window as Window & { testPushNotifications?: () => Promise<void> }).testPushNotifications = async function() {
      function log(message: string) {
        const output = document.getElementById('output')
        if (output) {
          output.innerHTML += '<p>' + message + '</p>'
        }
        console.log(message)
      }

      try {
        log('🔄 Starting push notification test...')
        
        // Request permission
        const permission = await Notification.requestPermission()
        log('Permission: ' + permission)
        
        if (permission !== 'granted') {
          log('❌ Permission denied')
          return
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js')
        log('✅ Service worker registered')

        // Get VAPID key
        const vapidResponse = await fetch('https://mtreplit.onrender.com/api/vapid-public-key/')
        const vapidData = await vapidResponse.json()
        log('✅ VAPID key received: ' + vapidData.publicKey.substring(0, 20) + '...')

        // Convert VAPID key
        function urlBase64ToUint8Array(base64String: string) {
          const padding = '='.repeat((4 - base64String.length % 4) % 4)
          const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/')
          const rawData = window.atob(base64)
          const outputArray = new Uint8Array(rawData.length)
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
          }
          return outputArray
        }

        // Subscribe
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey)
        })

        log('✅ Subscription created')
        log('Endpoint: ' + subscription.endpoint.substring(0, 50) + '...')
        
        // Type assertion to access keys property
        const subscriptionWithKeys = subscription as PushSubscription & {
          keys?: {
            p256dh: string
            auth: string
          }
        }
        
        log('Keys: ' + (subscriptionWithKeys.keys ? 'Present ✅' : 'Missing ❌'))

        if (subscriptionWithKeys.keys) {
          log('P256DH: ' + subscriptionWithKeys.keys.p256dh.substring(0, 20) + '...')
          log('Auth: ' + subscriptionWithKeys.keys.auth.substring(0, 10) + '...')

          // Send to backend
          const backendResponse = await fetch('https://mtreplit.onrender.com/api/push-subscriptions/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
              p256dh: subscriptionWithKeys.keys.p256dh,
              auth: subscriptionWithKeys.keys.auth
            })
          })

          if (backendResponse.ok) {
            log('✅ Subscription sent to backend successfully!')
            log('🎉 Now test the CRON job in Render!')
            log('📋 Run: python manage.py check_daily_reports')
          } else {
            const errorText = await backendResponse.text()
            log('❌ Failed to send to backend: ' + backendResponse.status + ' - ' + errorText)
          }
        } else {
          log('❌ No encryption keys - FCM will not work')
          log('⚠️ This will create a compatibility mode subscription that expires immediately')
        }

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        log('❌ Error: ' + errorMessage)
        console.error('Full error:', error)
      }
    }
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔔 Push Notification Test</h1>
      <p>This page tests if we can create valid push subscriptions with proper encryption keys.</p>
      
      <button 
        onClick={() => {
          const windowWithTest = window as Window & { testPushNotifications?: () => Promise<void> }
          windowWithTest.testPushNotifications?.()
        }} 
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🧪 Test Push Notifications
      </button>
      
      <div 
        id="output" 
        style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #ddd',
          borderRadius: '5px',
          minHeight: '100px'
        }}
      >
        <p>👆 Click the button above to start the test</p>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>📋 Expected Flow:</h3>
        <ol>
          <li>Request notification permission ✅</li>
          <li>Register service worker ✅</li>
          <li>Fetch VAPID public key ✅</li>
          <li>Create subscription with proper encryption keys ✅</li>
          <li>Send subscription to backend ✅</li>
          <li>Test CRON job in Render ✅</li>
        </ol>
      </div>
    </div>
  )
}