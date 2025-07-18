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
 * Sends the push subscription to the backend server.
 * @param {PushSubscription} subscription The push subscription object.
 * @returns {Promise<Response>} The response from the server.
 */
export async function sendSubscriptionToBackend(subscription) {
  const response = await fetch('/api/push-subscriptions/', {
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