import { db } from '@vercel/postgres';
import { getConnecterUser, unauthorizedResponse } from "../lib/session.js";
import PushNotifications from "@pusher/push-notifications-server";

export const config = {
    runtime: "edge",
};

export default async function handler(request) {
    let client;

    try {
        // 1️⃣ Authenticate user
        const user = await getConnecterUser(request);
        if (!user) {
            console.log("Not connected");
            return unauthorizedResponse();
        }

        // 2️⃣ Connect to database
        client = await db.connect();

        // 3️⃣ Handle GET request - Fetch messages
        if (request.method === "GET") {
            const url = new URL(request.url);
            const receiver_id = url.searchParams.get("receiver_id");

            if (!receiver_id) {
                return new Response(JSON.stringify({ message: "receiver_id is required" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            console.log("Fetching messages between", user.id, "and", receiver_id);

            const query = `
        SELECT 
          message_id AS id, 
          sender_id AS "from", 
          receiver_id AS "to", 
          content, 
          created_on AS timestamp
        FROM messages
        WHERE (sender_id = $1 AND receiver_id = $2) 
           OR (sender_id = $2 AND receiver_id = $1)
        ORDER BY created_on ASC
      `;

            const { rows } = await client.query(query, [user.id, receiver_id]);
            console.log("Messages fetched:", rows.length);

            return new Response(JSON.stringify(rows), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 4️⃣ Handle POST request - Send message
        if (request.method === "POST") {
            let body;
            try {
                body = await request.json();
            } catch {
                return new Response(JSON.stringify({ message: "Invalid JSON" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const { sender_id, receiver_id, content } = body;

            if (!sender_id || !receiver_id || !content) {
                return new Response(
                    JSON.stringify({ message: "Missing fields: sender_id, receiver_id, and content are required" }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            // ✅ Verify sender_id matches authenticated user
            if (Number(sender_id) !== Number(user.id)) {
                return new Response(
                    JSON.stringify({ message: "Unauthorized: sender_id does not match authenticated user" }),
                    { status: 403, headers: { "Content-Type": "application/json" } }
                );
            }

            // ✅ Save message in DB
            const insertQuery = `
        INSERT INTO messages (sender_id, receiver_id, content, created_on)
        VALUES ($1, $2, $3, NOW())
        RETURNING message_id, sender_id AS "from", receiver_id AS "to", content, created_on AS timestamp
      `;
            const { rows } = await client.query(insertQuery, [sender_id, receiver_id, content]);
            const newMessage = rows[0];
            console.log("Message saved:", newMessage);

            // ✅ Send Push Notification to receiver
            try {
                const beamsClient = new PushNotifications({
                    instanceId: process.env.PUSHER_INSTANCE_ID,
                    secretKey: process.env.PUSHER_SECRET_KEY,
                });

                // receiver_id must correspond to the `externalId` used in frontend `setUserId()`
                await beamsClient.publishToUsers([String(receiver_id)], {
                    web: {
                        notification: {
                            title: `Nouveau message de ${user.username || "Utilisateur"}`,
                            body: content,
                            icon: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                            deep_link: `/chat?receiver_id=${sender_id}`,
                        },
                        data: {
                            senderId: sender_id,
                            receiverId: receiver_id,
                            content,
                        },
                    },
                });

                console.log("Push notification sent to user:", receiver_id);
            } catch (err) {
                console.error("❌ Failed to send push notification:", err);
            }

            return new Response(JSON.stringify(newMessage), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 5️⃣ Handle unsupported methods
        return new Response(JSON.stringify({ message: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("💥 Error in /api/message:", error.message, error.stack);
        return new Response(JSON.stringify({ message: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    } finally {
        if (client) client.release();
    }
}
