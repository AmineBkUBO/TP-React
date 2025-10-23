import { db } from '@vercel/postgres';
import { getConnecterUser, unauthorizedResponse } from "../lib/session.js";
import { encryptMessage, decryptMessages } from "../lib/crypto.js";

export const config = { runtime: "edge" };

export default async function handler(request) {
    let client;

    try {
        const user = await getConnecterUser(request);
        if (!user) return unauthorizedResponse();

        client = await db.connect();

        // ===========================
        // GET MESSAGES
        // ===========================
        if (request.method === "GET") {
            const url = new URL(request.url);
            const receiver_id = url.searchParams.get("receiver_id");
            const room_id = url.searchParams.get("room_id");

            let rows = [];

            if (room_id) {
                const query = `
                    SELECT message_id AS id,
                           sender_id AS "from",
                           room_id AS "room",
                           content,
                           created_on AS timestamp
                    FROM messages
                    WHERE room_id = $1
                    ORDER BY created_on ASC
                `;
                ({ rows } = await client.query(query, [room_id]));
            } else if (receiver_id) {
                const query = `
                    SELECT message_id AS id,
                           sender_id AS "from",
                           receiver_id AS "to",
                           content,
                           created_on AS timestamp
                    FROM messages
                    WHERE (sender_id = $1 AND receiver_id = $2)
                       OR (sender_id = $2 AND receiver_id = $1)
                    ORDER BY created_on ASC
                `;
                ({ rows } = await client.query(query, [user.id, receiver_id]));
            } else {
                return new Response(JSON.stringify({ message: "receiver_id or room_id is required" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            const decryptedMessages = await decryptMessages(rows);

            return new Response(JSON.stringify(decryptedMessages), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // ===========================
        // POST MESSAGES
        // ===========================
        if (request.method === "POST") {
            let body;
            try { body = await request.json(); }
            catch {
                return new Response(JSON.stringify({ message: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
            }

            const { sender_id, receiver_id, room_id, content } = body;

            if (!sender_id || !content || (!receiver_id && !room_id)) {
                return new Response(JSON.stringify({ message: "Missing fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
            }

            if (Number(sender_id) !== Number(user.id)) {
                return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 403, headers: { "Content-Type": "application/json" } });
            }

            // ✅ Fix: await encryptMessage
            const encryptedContent = await encryptMessage(content);

            const insertQuery = `
                INSERT INTO messages (sender_id, receiver_id, room_id, content, created_on)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING message_id AS id,
                          sender_id AS "from",
                          receiver_id AS "to",
                          room_id AS "room",
                          content,
                          created_on AS timestamp
            `;

            const { rows } = await client.query(insertQuery, [
                sender_id,
                receiver_id || null,
                room_id || null,
                encryptedContent
            ]);

            // Return plaintext to sender
            const returnedMessage = { ...rows[0], content };

            return new Response(JSON.stringify(returnedMessage), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });

    } catch (error) {
        console.error("💥 Error in /api/message:", error.message, error.stack);
        return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    } finally {
        if (client) client.release();
    }
}
