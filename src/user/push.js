import { Client, TokenProvider } from '@pusher/push-notifications-web';

export async function initBeams({ instanceId, token, userExternalId }) {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return null;
    }

    try {
        const permission = await window.Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('Notification permission not granted:', permission);
            return null;
        }
    } catch (err) {
        console.error('Notification permission error:', err);
        return null;
    }

    const beamsClient = new Client({
        instanceId, // Your Pusher Beams instance ID
    });

    const tp = new TokenProvider({
        url: `/api/beams?user_id=${encodeURIComponent(userExternalId)}`,
        headers: { Authorization: `Bearer ${token}` },
    });

    try {
        await beamsClient.start();
        await beamsClient.addDeviceInterest('global');
        await beamsClient.setUserId(String(userExternalId), tp);

        const deviceId = await beamsClient.getDeviceId();
        console.log('✅ Beams started. Device ID:', deviceId);
        return beamsClient;
    } catch (err) {
        console.error('❌ Beams init error:', err);
        return null;
    }
}
