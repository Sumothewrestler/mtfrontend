// /src/app/test/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('✅ Service Worker registered'))
        .catch((error) => console.error('❌ Service Worker registration failed:', error))
    }
  }, [])

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BNhS_Q1y2W4Y7-48d7nKqxrVgP3ivvphYKx_wwk81RHex9R-mTiCQsg5MOZNdnHQ2LVLhDyrHGAtDL1wVZ4_ckc',
      })
      setSubscription(subscription)
      console.log('✅ Push Subscription:', JSON.stringify(subscription))
      setMessage('Subscribed to push notifications!')
      // TODO: Send this subscription object to your Django backend
    } catch (err) {
      console.error('❌ Push subscription error:', err)
      setMessage('Push subscription failed')
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Push Notification Test</h1>
      <button
        onClick={subscribeToPush}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Subscribe to Notifications
      </button>
      <p className="mt-4">{message}</p>
      {subscription && (
        <pre className="mt-4 bg-gray-100 p-2 text-sm">
          {JSON.stringify(subscription, null, 2)}
        </pre>
      )}
    </main>
  )
}
