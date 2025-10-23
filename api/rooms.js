import { db } from "@vercel/postgres";
import { getConnecterUser, unauthorizedResponse } from "../lib/session.js";

export const config = { runtime: "edge" };

export default async function handler(request) {
    let client;

    try {
        const user = await getConnecterUser(request);
        if (!user) return unauthorizedResponse();

        client = await db.connect();

        if (request.method === "GET") {
            const { rows } = await client.query("SELECT * FROM rooms ORDER BY created_on ASC");
            return new Response(JSON.stringify(rows), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (request.method === "POST") {
            const body = await request.json();
            const { name } = body;
            if (!name) return new Response(JSON.stringify({ message: "Room name is required" }), { status: 400, headers: { "Content-Type": "application/json" } });

            const insertQuery = `
                INSERT INTO rooms (name, created_on, created_by)
                VALUES ($1, NOW(), $2)
                RETURNING room_id, name, created_on, created_by
            `;
            const { rows } = await client.query(insertQuery, [name, user.id]);
            return new Response(JSON.stringify(rows[0]), { status: 200, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });

    } catch (error) {
        console.error("💥 Error in /api/rooms:", error);
        return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    } finally {
        if (client) client.release();
    }
}
