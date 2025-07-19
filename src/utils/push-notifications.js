/**
 * Checks if the browser supports push notifications.
 * @returns {boolean} True if supported, false otherwise.
 */
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Requests permission from the user to send push notifications.
 * @returns {Promise<NotificationPermission>} The permission status.
 */
export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission not granted for Notification');
  }
  return permission;
}

/**
 * Subscribes the user to push notifications.
 * @param {string} vapidPublicKey The VAPID public key from the server.
 * @returns {Promise<PushSubscription>} The push subscription object.
 */
export async function subscribeUserToPush(vapidPublicKey) {
  try {
    console.log('🔄 Waiting for service worker to be ready...');
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    console.log('✅ Service worker is ready:', serviceWorkerRegistration);

    console.log('🔍 Checking for existing subscription...');
    const existingSubscription = await serviceWorkerRegistration.pushManager.getSubscription();

    if (existingSubscription) {
      console.log('✅ Found existing subscription:', {
        endpoint: existingSubscription.endpoint.substring(0, 50) + '...'
      });
      return existingSubscription;
    }

    console.log('📝 No existing subscription found, creating new one...');
    console.log('🔑 Using application server key (length):', vapidPublicKey.length);

    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });

    console.log('✅ New subscription created successfully:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      keys: subscription.keys ? 'Present' : 'Missing'
    });

    return subscription;
  } catch (error) {
    console.error('❌ Error in subscribeUserToPush:', error);
    throw error;
  }
}

/**
 * Fetches the VAPID public key from the backend.
 * @returns {Promise<string>} The VAPID public key.
 */
export async function getVapidPublicKey() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}vapid-public-key/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch VAPID public key: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching VAPID public key:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

/**
 * Converts a VAPID public key to Uint8Array format.
 * @param {string} vapidKey The base64 VAPID public key.
 * @returns {Uint8Array} The key in Uint8Array format.
 */
export function urlBase64ToUint8Array(vapidKey) {
  const padding = '='.repeat((4 - vapidKey.length % 4) % 4);
  const base64 = (vapidKey + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Sends the push subscription to the backend server.
 * @param {PushSubscription} subscription The push subscription object.
 * @returns {Promise<Response>} The response from the server.
 */
export async function sendSubscriptionToBackend(subscription) {
  try {
    // Convert PushSubscription to the format expected by backend
    const subscriptionData = {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    };

    console.log('📤 Sending subscription data:', {
      endpoint: subscriptionData.endpoint.substring(0, 50) + '...',
      p256dh: subscriptionData.p256dh ? 'Present' : 'Missing',
      auth: subscriptionData.auth ? 'Present' : 'Missing'
    });

    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}push-subscriptions/`;
    console.log('📡 POST URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response body:', errorText);
      throw new Error(`Failed to send subscription to backend: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ Backend response:', responseData);
    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error sending subscription to backend:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

/**
 * Complete push notification setup process.
 * @returns {Promise<boolean>} True if setup successful, false otherwise.
 */
export async function setupPushNotifications() {
  try {
    console.log('🚀 Starting push notification setup...');
    
    // Check if push notifications are supported
    if (!isPushSupported()) {
      console.warn('Push notifications are not supported');
      return false;
    }
    console.log('✅ Push notifications are supported');

    // Request permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Push notification permission denied');
      return false;
    }
    console.log('✅ Permission granted:', permission);

    // Get VAPID public key
    console.log('📡 Fetching VAPID public key...');
    const vapidPublicKey = await getVapidPublicKey();
    console.log('✅ VAPID public key received:', vapidPublicKey.substring(0, 20) + '...');
    
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    console.log('✅ Application server key converted');

    // Subscribe user to push notifications
    console.log('📝 Subscribing to push notifications...');
    const subscription = await subscribeUserToPush(applicationServerKey);
    console.log('✅ Push subscription created:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      keys: subscription.keys ? 'Present' : 'Missing'
    });

    // Send subscription to backend
    console.log('📤 Sending subscription to backend...');
    await sendSubscriptionToBackend(subscription);
    console.log('✅ Subscription sent to backend successfully');

    console.log('🎉 Push notifications setup complete!');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Push notification setup failed:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('❌ Push notification setup failed:', error);
    }
    return false;
  }
}