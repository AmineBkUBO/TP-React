import * as PusherPushNotifications from '@pusher/push-notifications-web';

const BEAMS_INSTANCE_ID = "84ae2afe-b806-4865-9a0b-939025ffdfe3";
let beamsClient = null;

export async function initBeams(userId, userName) {
    if (!BEAMS_INSTANCE_ID) throw new Error("Instance ID is required");

    if (!beamsClient) {
        beamsClient = new PusherPushNotifications.Client({
            instanceId: BEAMS_INSTANCE_ID
        });
    }

    try {
        await beamsClient.start();

        await new Promise((resolve) => setTimeout(resolve, 500));

        await beamsClient.addDeviceInterest(`user-${userId}`);
    } catch (err) {
        console.error("Beams initialization failed:", err);

        beamsClient = null;
        throw err;
    }

    return beamsClient;
}

export function getBeamsClient() {
    return beamsClient;
}
