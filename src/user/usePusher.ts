import { useEffect, useRef } from 'react';
import * as PusherPushNotifications from '@pusher/push-notifications-web';

export function usePusher(userId: string | null, externalId: string | null) {
    const beamsClientRef = useRef<any>(null);

    useEffect(() => {
        if (!userId || !externalId) {
            console.log("⚠️ No user ID or external ID, skipping Pusher setup");
            return;
        }

        const initPusher = async () => {
            try {
                // Request notification permission
                const permission = await window.Notification.requestPermission();

                if (permission !== 'granted') {
                    console.log("⚠️ Notification permission denied");
                    return;
                }

                console.log("✅ Notification permission granted");

                // Initialize Pusher Beams client
                const beamsClient = new PusherPushNotifications.Client({
                    instanceId: process.env.PUSHER_INSTANCE_ID || '',
                });

                beamsClientRef.current = beamsClient;

                const token = sessionStorage.getItem("token");
                if (!token) {
                    console.error("❌ No token found");
                    return;
                }

                // Configure token provider
                const beamsTokenProvider = new PusherPushNotifications.TokenProvider({
                    url: "/api/beams",
                    headers: {
                        Authentication: `Bearer ${token}`,
                    },
                });

                // Start Beams and subscribe
                await beamsClient.start();
                console.log("✅ Pusher Beams started");

                // Subscribe to global interest
                await beamsClient.addDeviceInterest('global');
                console.log("✅ Subscribed to global interest");

                // Set user ID
                await beamsClient.setUserId(externalId, beamsTokenProvider);
                console.log("✅ User ID set:", externalId);

                // Get device ID
                const deviceId = await beamsClient.getDeviceId();
                console.log("✅ Push notification device ID:", deviceId);

            } catch (error) {
                console.error("❌ Error initializing Pusher:", error);
            }
        };

        initPusher();

        // Cleanup
        return () => {
            if (beamsClientRef.current) {
                beamsClientRef.current.stop().catch(console.error);
            }
        };
    }, [userId, externalId]);

    return beamsClientRef.current;
}