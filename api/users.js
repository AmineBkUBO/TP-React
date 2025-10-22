import { sql } from "@vercel/postgres";
import { Redis } from "@upstash/redis";

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

async function checkSession(request) {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader) return false;

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return false;

    const token = parts[1];
    const user = await redis.get(token);
    return !!user;
}

function unauthorizedResponse() {
    return new Response(JSON.stringify({ code: "UNAUTHORIZED", message: "Not authorized" }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
    });
}

export default async function handler(request) {
    try {
        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return unauthorizedResponse();
        }

        const { rowCount, rows } = await sql`
      SELECT user_id, username, TO_CHAR(last_login, 'DD/MM/YYYY HH24:MI') as last_login
      FROM users
      ORDER BY last_login DESC`;

        console.log("Got " + rowCount + " users");

        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ code: "INTERNAL_ERROR", message: "Server error", details: error }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
