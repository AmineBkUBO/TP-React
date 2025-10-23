import { db } from '@vercel/postgres';
import { getConnecterUser, unauthorizedResponse } from "../lib/session.js";

export const config = {
    runtime: "edge",
};

export default async function handler(request) {
    let client;

    try {
        // Get authenticated user
        const user = await getConnecterUser(request);
        if (!user) {
            console.log("Not connected");
            return unauthorizedResponse();
        }

        // Connect to database
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
                // Fetch room messages
                console.log("Fetching messages for room", room_id);
                const query = `
                    SELECT
                        message_id AS id,
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
                // Fetch private messages
                console.log("Fetching private messages between", user.id, "and", receiver_id);
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
                ({ rows } = await client.query(query, [user.id, receiver_id]));
            } else {
                return new Response(
                    JSON.stringify({ message: "receiver_id or room_id is required" }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            return new Response(JSON.stringify(rows), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // ===========================
        // POST MESSAGES
        // ===========================
        if (request.method === "POST") {
            let body;
            try {
                body = await request.json();
            } catch {
                return new Response(JSON.stringify({ message: "Invalid JSON" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            const { sender_id, receiver_id, room_id, content } = body;

            if (!sender_id || !content || (!receiver_id && !room_id)) {
                return new Response(
                    JSON.stringify({ message: "Missing fields: sender_id, content, and either receiver_id or room_id are required" }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            if (Number(sender_id) !== Number(user.id)) {
                return new Response(
                    JSON.stringify({ message: "Unauthorized: sender_id does not match authenticated user" }),
                    { status: 403, headers: { "Content-Type": "application/json" } }
                );
            }

            const insertQuery = `
                INSERT INTO messages (sender_id, receiver_id, room_id, content, created_on)
                VALUES ($1, $2, $3, $4, NOW())
                    RETURNING 
                    message_id AS id,
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
                content
            ]);

            return new Response(JSON.stringify(rows[0]), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ message: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("💥 Error in /api/message:", error.message, error.stack);
        return new Response(
            JSON.stringify({ message: error.message, error: process.env.NODE_ENV === 'development' ? error.stack : undefined }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    } finally {
        if (client) client.release();
    }
}
