import { useState } from 'react';
import { registerServiceWorker, requestNotificationPermission, subscribeToPushNotifications } from '../utils/pushNotifications';

export default function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const handleSubscribe = async () => {
    try {
      const registration = await registerServiceWorker();
      const permission = await requestNotificationPermission();
      
      if (permission) {
        const subscription = await subscribeToPushNotifications(registration);
        
        // Send subscription to your Django backend
        await fetch('/api/subscribe/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: subscription.toJSON()
          })
        });
        
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  };
  
  return (
    <button onClick={handleSubscribe} disabled={isSubscribed}>
      {isSubscribed ? 'Subscribed' : 'Enable Notifications'}
    </button>
  );
} 