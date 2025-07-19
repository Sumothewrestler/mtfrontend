'use client'

import { useState } from 'react';

export default function TestPushNotification() {
  const [isLoading, setIsLoading] = useState(false);

  const sendTestNotification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}test-push-notification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test push notification from Metro Transports!',
        }),
      });

      if (response.ok) {
        alert('✅ Test notification sent! Check your notifications.');
      } else {
        alert('❌ Failed to send test notification. Make sure you are subscribed.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('❌ Error sending test notification. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h4 className="text-md font-semibold mb-2 text-blue-900 dark:text-blue-100">
        Test Push Notifications
      </h4>
      <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
        Send a test notification to verify everything is working correctly.
      </p>
      <button
        onClick={sendTestNotification}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isLoading ? 'Sending...' : 'Send Test Notification'}
      </button>
    </div>
  );
}