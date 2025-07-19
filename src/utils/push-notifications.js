/**
 * Checks if the browser supports push notifications.
 * @returns {boolean} True if supported, false otherwise.
 */
export function isPushSupported() {
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;
  
  console.log('🔍 Push support check:', {
    serviceWorker: hasServiceWorker,
    pushManager: hasPushManager,
    supported: hasServiceWorker && hasPushManager
  });
  
  return hasServiceWorker && hasPushManager;
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
    
    // Add timeout to prevent hanging indefinitely
    const serviceWorkerRegistration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Service worker ready timeout after 10 seconds')), 10000)
      )
    ]);
    
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

    // Try to subscribe with detailed error handling
    let subscription;
    try {
      subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });
    } catch (subscribeError) {
      console.error('❌ Push subscription with VAPID failed:', subscribeError);
      
      // Try alternative approach: recreate the VAPID key with different padding
      console.log('🔄 Trying alternative VAPID key format...');
      try {
        // Try with the original key without our conversion
        const originalVapidKey = await getVapidPublicKey();
        const alternativeKey = new TextEncoder().encode(originalVapidKey);
        
        subscription = await serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: alternativeKey,
        });
        console.log('✅ Subscription created with alternative VAPID key format');
      } catch (alternativeError) {
        console.error('❌ Alternative VAPID format also failed:', alternativeError);
        
        // Final fallback: try without VAPID key (some browsers support this)
        console.log('🔄 Trying subscription without VAPID key (final fallback)...');
        try {
          subscription = await serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
          });
          console.log('⚠️ Subscription created without VAPID key (fallback method)');
        } catch (fallbackError) {
          console.error('❌ All subscription methods failed:', fallbackError);
          throw new Error(`Push subscription failed with all methods: ${subscribeError.message}`);
        }
      }
    }

    console.log('✅ New subscription created successfully:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      keys: subscription.keys ? 'Present' : 'Missing',
      keysDetail: subscription.keys ? {
        p256dh: subscription.keys.p256dh ? 'Present' : 'Missing',
        auth: subscription.keys.auth ? 'Present' : 'Missing'
      } : 'Keys object is undefined'
    });

    // Check if keys are present
    if (!subscription.keys) {
      console.warn('⚠️ Push subscription keys are missing. Trying to recreate subscription...');
      
      // Try to unsubscribe and resubscribe
      try {
        await subscription.unsubscribe();
        console.log('🔄 Unsubscribed from previous subscription, trying again...');
        
        // Wait a moment and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        subscription = await serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey,
        });
        
        console.log('🔄 Recreated subscription:', {
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          keys: subscription.keys ? 'Present' : 'Still Missing'
        });
        
        if (!subscription.keys) {
          throw new Error('Push subscription keys are still missing after recreation. This browser may not support VAPID keys properly.');
        }
      } catch (recreateError) {
        console.error('❌ Failed to recreate subscription:', recreateError);
        throw new Error('Push subscription keys are missing and recreation failed. This might be a browser compatibility issue.');
      }
    }

    if (!subscription.keys.p256dh || !subscription.keys.auth) {
      throw new Error('Push subscription keys are incomplete. p256dh or auth key is missing.');
    }

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
  // Handle the specific case where VAPID key is 87 characters (needs 1 padding)
  let processedKey = vapidKey;
  
  // If the key is 87 characters, add one padding character
  if (vapidKey.length === 87) {
    processedKey = vapidKey + '=';
    console.log('🔧 Added padding to 87-character VAPID key');
  }
  
  // Add proper padding for base64 decoding
  const padding = '='.repeat((4 - (processedKey.length % 4)) % 4);
  const base64 = (processedKey + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  console.log('🔍 VAPID key conversion:', {
    originalLength: vapidKey.length,
    processedLength: processedKey.length,
    paddingAdded: padding.length,
    finalLength: base64.length,
    base64Sample: base64.substring(0, 20) + '...'
  });

  try {
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    console.log('✅ VAPID key converted successfully:', {
      outputLength: outputArray.length,
      expectedLength: 65,
      isCorrectLength: outputArray.length === 65
    });
    
    if (outputArray.length !== 65) {
      throw new Error(`VAPID key should be 65 bytes, got ${outputArray.length} bytes`);
    }
    
    return outputArray;
  } catch (error) {
    console.error('❌ VAPID key conversion failed:', error);
    throw new Error(`Invalid VAPID key format: ${error.message}`);
  }
}

/**
 * Sends the push subscription to the backend server.
 * @param {PushSubscription} subscription The push subscription object.
 * @returns {Promise<Response>} The response from the server.
 */
export async function sendSubscriptionToBackend(subscription) {
  try {
    // Check if subscription has keys
    if (!subscription.keys) {
      throw new Error('Push subscription is missing keys object');
    }

    if (!subscription.keys.p256dh || !subscription.keys.auth) {
      throw new Error('Push subscription keys are incomplete');
    }

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

    // Check if any service workers are registered
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('📋 Service worker registrations found:', registrations.length);
      
      if (registrations.length === 0) {
        console.error('❌ No service workers registered');
        throw new Error('No service workers registered. Please refresh the page and try again.');
      }
      
      registrations.forEach((reg, index) => {
        console.log(`📋 Registration ${index + 1}:`, {
          scope: reg.scope,
          state: reg.active ? 'active' : 'inactive'
        });
      });
    }

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
    console.log('🔍 Full VAPID key length:', vapidPublicKey.length);
    console.log('🔍 VAPID key format check:', {
      startsWithB: vapidPublicKey.startsWith('B'),
      hasValidChars: /^[A-Za-z0-9_-]+$/.test(vapidPublicKey),
      actualLength: vapidPublicKey.length,
      expectedLength: 88, // Base64 encoded 65-byte key
      needsPadding: vapidPublicKey.length < 88
    });
    
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    console.log('✅ Application server key converted:', {
      length: applicationServerKey.length,
      type: applicationServerKey.constructor.name,
      firstBytes: Array.from(applicationServerKey.slice(0, 5))
    });

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