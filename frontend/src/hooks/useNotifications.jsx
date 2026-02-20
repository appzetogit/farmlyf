import { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import useUserStore from '../store/useUserStore';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

export const useNotifications = () => {
  const hasWindow = typeof window !== 'undefined';
  const hasNotificationApi = hasWindow && typeof window.Notification !== 'undefined';
  const [notificationPermission, setNotificationPermission] = useState(
    hasNotificationApi ? window.Notification.permission : 'unsupported'
  );
  const { user } = useAuth();
  const addNotification = useUserStore((state) => state.addNotification);
  const targetUserId = user?.id || 'guest';

  const persistIncomingNotification = (payload) => {
    const { title, body } = getNotificationText(payload || {});
    addNotification(targetUserId, {
      title,
      body,
      data: payload?.data || {},
      createdAt: new Date().toISOString()
    });
    return { title, body };
  };

  const getNotificationText = (payload) => {
    const title =
      payload?.notification?.title ||
      payload?.data?.heading ||
      payload?.data?.title ||
      'New Notification';
    const body =
      payload?.notification?.body ||
      payload?.data?.message ||
      payload?.data?.body ||
      'You have a new update.';
    return { title, body };
  };

  const showForegroundSystemNotification = async (payload) => {
    if (!hasNotificationApi) return;
    if (window.Notification.permission !== 'granted') return;
    const { title, body } = getNotificationText(payload);
    const options = {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: payload?.data || {}
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
        if (registration) {
          await registration.showNotification(title, options);
          return;
        }
      }
      new window.Notification(title, options);
    } catch (error) {
      console.error('Failed to show foreground system notification:', error);
    }
  };

  // Register FCM token with backend
  const registerFcmToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/users/fcm-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('farmlyf_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        console.log('FCM token registered successfully');
      } else {
        console.error('Failed to register FCM token');
      }
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  };

  // Request permission and register token
  const initNotifications = async () => {
    try {
      if (!hasNotificationApi) {
        setNotificationPermission('unsupported');
        return;
      }
      if (notificationPermission === 'denied') {
        console.log('Notification permission already denied');
        return;
      }
      const token = await requestNotificationPermission();
      if (token && user) {
        await registerFcmToken(token);
        setNotificationPermission('granted');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  // Auto-init for logged in users who haven't granted permission yet
  useEffect(() => {
    if (user && notificationPermission === 'default') {
      // Don't auto-prompt immediately on every page load unless specific action?
      // For now, let's keep it manual or call it on login.
    }
    
    // If permission is already granted, refresh the token
    if (user && notificationPermission === 'granted') {
        initNotifications();
    }
  }, [user, notificationPermission, hasNotificationApi]);

  const playBuzzer = () => {
    if (!hasWindow) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // "Buzzer" sound: rising square wave
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.2);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.8);
      
      // Close context after playing to free resources
      setTimeout(() => audioCtx.close(), 1000);
    } catch (e) {
      console.warn('Audio alert failed (user may need to interact with page first):', e);
    }
  };

  // Listen for foreground messages (continuous)
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const unsubscribe = onMessageListener((payload) => {
      console.log('Foreground notification received:', payload);
      const { title, body } = persistIncomingNotification(payload);

      // If it's a new order for admin, play the buzzer
      if (payload?.data?.type === 'NEW_ORDER' && user?.role === 'admin') {
        playBuzzer();
      }

      // Show a native notification in foreground so users see it even when actively browsing.
      showForegroundSystemNotification(payload);

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {body}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    });

    // Cleanup on unmount
    return () => unsubscribe && unsubscribe();
  }, [notificationPermission, addNotification, targetUserId, user?.id]);

  // Capture push events forwarded by the service worker (background delivery path).
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleServiceWorkerMessage = (event) => {
      const data = event?.data;
      if (!data || data.type !== 'PUSH_NOTIFICATION') return;

      const payload = data.payload || {};
      persistIncomingNotification(payload);
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [addNotification, targetUserId]);

  return {
    notificationPermission,
    initNotifications
  };
};
