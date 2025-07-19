'use client'

import { useState, useEffect } from 'react';
import { setupPushNotifications, isPushSupported } from '@/utils/push-notifications';

export default function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported(isPushSupported());
    
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check if user is already subscribed
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const success = await setupPushNotifications();
      if (success) {
        setPermission('granted');
        setIsSubscribed(true);
        alert('✅ Push notifications enabled successfully!');
      } else {
        alert('❌ Failed to enable push notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('❌ Error enabling notifications. Please check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          setIsSubscribed(false);
          alert('🔕 Push notifications disabled');
        }
      } catch (error) {
        console.error('Error disabling notifications:', error);
        alert('❌ Error disabling notifications');
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          ⚠️ Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Push Notifications
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Status: {isSubscribed ? '✅ Enabled' : '🔕 Disabled'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Permission: {permission}
            </p>
          </div>
          
          <div className="space-x-2">
            {!isSubscribed ? (
              <button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </button>
            ) : (
              <button
                onClick={handleDisableNotifications}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Disable Notifications
              </button>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>• Daily report reminders</p>
          <p>• Important system notifications</p>
          <p>• Task and deadline alerts</p>
        </div>
      </div>
    </div>
  );
}