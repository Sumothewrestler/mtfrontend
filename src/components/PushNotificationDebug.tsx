import React, { useState, useEffect } from 'react';

const PushNotificationDebug: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking...');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // Check notification permission
      setPermission(Notification.permission);

      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        setStatus('❌ Service Worker not supported');
        return;
      }

      // Check if push is supported
      if (!('PushManager' in window)) {
        setStatus('❌ Push notifications not supported');
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setStatus('❌ Service Worker not registered');
        return;
      }

      // Check for existing subscription
      const existingSub = await registration.pushManager.getSubscription();
      setSubscription(existingSub);

      if (existingSub) {
        setStatus('✅ Push notifications enabled');
      } else {
        setStatus('⚠️ Push notifications not subscribed');
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      checkStatus();
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from your browser',
        icon: '/logo.png'
      });
    }
  };

  const testBackendEndpoint = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}vapid-public-key/`);
      if (response.ok) {
        const data = await response.json();
        alert(`✅ Backend connection successful! VAPID key: ${data.publicKey ? 'Present' : 'Missing'}`);
      } else {
        alert(`❌ Backend error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      alert(`❌ Backend connection failed: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>🔔 Push Notification Debug Panel</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {status}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Permission:</strong> {permission}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Subscription:</strong> {subscription ? '✅ Active' : '❌ None'}
      </div>

      {subscription && (
        <div style={{ marginBottom: '10px', fontSize: '12px' }}>
          <strong>Endpoint:</strong> {subscription.endpoint.substring(0, 50)}...
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={checkStatus}>🔄 Refresh Status</button>
        
        {permission !== 'granted' && (
          <button onClick={requestPermission}>🔑 Request Permission</button>
        )}
        
        {permission === 'granted' && (
          <button onClick={testNotification}>🧪 Test Local Notification</button>
        )}
        
        <button onClick={testBackendEndpoint}>🌐 Test Backend Connection</button>
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <p><strong>Expected flow:</strong></p>
        <ol>
          <li>Permission should be &quot;granted&quot;</li>
          <li>Service worker should be registered</li>
          <li>Push subscription should be active</li>
          <li>Backend connection should work</li>
        </ol>
      </div>
    </div>
  );
};

export default PushNotificationDebug;