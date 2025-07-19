'use client'

import PushNotificationSettings from '@/components/PushNotificationSettings';
import TestPushNotification from '@/components/TestPushNotification';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your application preferences and notifications
          </p>
        </div>

        <div className="space-y-6">
          <PushNotificationSettings />
          
          <TestPushNotification />
          
          {/* You can add more settings sections here */}
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              App Information
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>Version: 1.0.0</p>
              <p>Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}