import React, { useEffect } from 'react';
import {
  isPushSupported,
  requestNotificationPermission,
  subscribeUserToPush,
  sendSubscriptionToBackend,
} from './utils/push-notifications';

function App() {
  useEffect(() => {
    async function handlePushNotifications() {
      if (!isPushSupported()) {
        console.warn('Push notifications are not supported by this browser.');
        return;
      }

      try {
        await requestNotificationPermission();

        const response = await fetch('/api/vapid-public-key/');
        const data = await response.json();
        const vapidPublicKey = data.publicKey;

        const subscription = await subscribeUserToPush(vapidPublicKey);
        await sendSubscriptionToBackend(subscription);

        console.log('Successfully subscribed to push notifications.');
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
      }
    }

    handlePushNotifications();
  }, []);

  return (
    <div className="App">
      <h1>Push Notification Demo</h1>
      <p>Check the console for messages about push notification subscription.</p>
    </div>
  );
}

export default App; 