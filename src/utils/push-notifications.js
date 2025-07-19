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
  const serviceWorkerRegistration = await navigator.serviceWorker.ready;
  const existingSubscription = await serviceWorkerRegistration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  const subscription = await serviceWorkerRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey,
  });

  return subscription;
}

/**
 * Fetches the VAPID public key from the backend.
 * @returns {Promise<string>} The VAPID public key.
 */
export async function getVapidPublicKey() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const response = await fetch(`${backendUrl}/api/vapid-public-key/`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch VAPID public key');
  }
  
  const data = await response.json();
  return data.publicKey;
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
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const response = await fetch(`${backendUrl}/api/push-subscriptions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error('Failed to send subscription to backend.');
  }

  return response.json();
}

/**
 * Complete push notification setup process.
 * @returns {Promise<boolean>} True if setup successful, false otherwise.
 */
export async function setupPushNotifications() {
  try {
    // Check if push notifications are supported
    if (!isPushSupported()) {
      console.warn('Push notifications are not supported');
      return false;
    }

    // Request permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Push notification permission denied');
      return false;
    }

    // Get VAPID public key
    const vapidPublicKey = await getVapidPublicKey();
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe user to push notifications
    const subscription = await subscribeUserToPush(applicationServerKey);

    // Send subscription to backend
    await sendSubscriptionToBackend(subscription);

    console.log('✅ Push notifications setup complete');
    return true;
  } catch (error) {
    console.error('❌ Push notification setup failed:', error);
    return false;
  }
} 