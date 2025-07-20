import React, { useEffect } from 'react';
import {
  isPushSupported,
  requestNotificationPermission,
  subscribeUserToPush,
  sendSubscriptionToBackend,
} from './utils/push-notifications';
import PushNotificationDebug from './components/PushNotificationDebug';

function App() {
  useEffect(() => {
    async function handlePushNotifications() {
      if (!isPushSupported()) {
        console.warn('Push notifications are not supported by this browser.');
        return;
      }

      try {
        console.log('🔑 Requesting notification permission...');
        await requestNotificationPermission();
        console.log('✅ Notification permission granted');

        console.log('🔑 Fetching VAPID public key...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}vapid-public-key/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch VAPID key: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const vapidPublicKey = data.publicKey;
        console.log('✅ VAPID public key received:', vapidPublicKey ? 'Yes' : 'No');

        console.log('🔔 Subscribing to push notifications...');
        const subscription = await subscribeUserToPush(vapidPublicKey);
        console.log('✅ Push subscription successful');

        console.log('📡 Sending subscription to backend...');
        await sendSubscriptionToBackend(subscription);
        console.log('✅ Subscription sent to backend successfully');

        console.log('🎉 Successfully subscribed to push notifications!');
      } catch (error) {
        console.error('❌ Failed to subscribe to push notifications:', error);
        console.error('Error details:', error.message);
      }
    }

    handlePushNotifications();
  }, []);

  return (
    <div className="App">
      <h1>Push Notification Demo</h1>
      <p>Check the console for messages about push notification subscription.</p>
      <PushNotificationDebug />
    </div>
  );
}

export default App; 