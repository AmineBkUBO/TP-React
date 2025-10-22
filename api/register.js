import { db } from '@vercel/postgres';
import { Redis } from '@upstash/redis';
import { arrayBufferToBase64, stringToArrayBuffer } from "../lib/base64";

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        const { username, password, email } = await request.json();

        if (!username || !password || !email) {
            const error = { code: "BAD_REQUEST", message: "Missing required fields" };
            return new Response(JSON.stringify(error), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            });
        }

        const hash = await crypto.subtle.digest(
            'SHA-256',
            stringToArrayBuffer(username + password)
        );
        const hashed64 = arrayBufferToBase64(hash);

        const client = await db.connect();

        // Check if username or email already exist
        const existing = await client.sql`
      SELECT * FROM users WHERE username = ${username} OR email = ${email}
    `;
        if (existing.rowCount > 0) {
            const error = { code: "CONFLICT", message: "Username or email already exists" };
            return new Response(JSON.stringify(error), {
                status: 409,
                headers: { 'content-type': 'application/json' },
            });
        }

        // ✅ Generate a unique external_id
        const externalId = crypto.randomUUID();

        // Insert new user
        await client.sql`
      INSERT INTO users (username, password, email, created_on, external_id)
      VALUES (${username}, ${hashed64}, ${email}, NOW(), ${externalId})
    `;

        // Create token and store user session
        const token = crypto.randomUUID();
        const user = { username, email, externalId };

        await redis.set(token, user, { ex: 3600 }); // 1 hour session
        await redis.hset("users", { [externalId]: user });

        return new Response(
            JSON.stringify({ token, username, email, externalId }),
            {
                status: 200,
                headers: { 'content-type': 'application/json' },
            }
        );
    } catch (error) {
        console.error("Register error:", error);
        const err = {
            code: "INTERNAL_ERROR",
            message: "Server error",
            details: error.message || error,
        };
        return new Response(JSON.stringify(err), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
