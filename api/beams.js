import {getConnecterUser, triggerNotConnected} from "../lib/session.js";

//const PushNotifications = require("@pusher/push-notifications-server");
import PushNotifications from "@pusher/push-notifications-server";


export default async (req, res) => {
    console.log('start notification')

    const userIDInQueryParam = req.query["user_id"];
    const user = await getConnecterUser(req);

    if (user === undefined || user === null || userIDInQueryParam !== user.externalId) {
        triggerNotConnected(res);
        return;
    }
    console.log("notificationnn")

    //console.log("IncenceId "+process.env.PUSHER_INSTANCE_ID);
    //console.log("secretKey " + process.env.PUSHER_SECRET_KEY);


    //const instanceId = process.env.PUSHER_INSTANCE_ID;
    //const secretKey =process.env.PUSHER_SECRET_KEY;

    // Je sais que c'est une mauvaise pratique, mais ça voulait pas les extraire du fichier .env :/
    const beamsClient = new PushNotifications({
        instanceId: '84ae2afe-b806-4865-9a0b-939025ffdfe3',
        secretKey: '3986830EC00DC4195D74E8DEEC8B3223D3186D3BE4B3E673E13EADD7BC498515',
    });

    const beamsToken = beamsClient.generateToken(user.externalId);
    console.log("token value",beamsToken)
    res.send(beamsToken);

};