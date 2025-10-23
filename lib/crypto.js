const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

async function getEncryptionKey() {
    const secret = process.env.ENCRYPTION_SECRET || "mymy-super-secret-encryption-key-at-least-32-characters-long-12345";

    if (!secret) {
        throw new Error('ENCRYPTION_SECRET environment variable is not set');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    return await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptMessage(plainText) {
    if (!plainText) {
        throw new Error('plainText is required for encryption');
    }

    try {
        const key = await getEncryptionKey();

        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

        const encoder = new TextEncoder();
        const data = encoder.encode(plainText);

        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: ALGORITHM, iv: iv },
            key,
            data
        );

        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);

        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt message');
    }
}

export async function decryptMessage(encryptedData) {
    if (!encryptedData) {
        throw new Error('encryptedData is required for decryption');
    }

    if (encryptedData === '{}' || encryptedData.length < 20) {
        return encryptedData;
    }

    try {
        const key = await getEncryptionKey();
        const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
        const iv = combined.slice(0, IV_LENGTH);
        const encryptedBuffer = combined.slice(IV_LENGTH);

        const decryptedBuffer = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encryptedBuffer);
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedData;
    }
}

export async function encryptMessages(messages) {
    return Promise.all(messages.map(async (msg) => ({
        ...msg,
        content: msg.content ? await encryptMessage(msg.content) : msg.content
    })));
}

export async function decryptMessages(messages) {
    return Promise.all(messages.map(async (msg) => {
        if (!msg.content || msg.content === '{}' || msg.content.length < 20) {
            return { ...msg, content: msg.content || '' };
        }
        try {
            return { ...msg, content: await decryptMessage(msg.content) };
        } catch {
            return { ...msg, content: msg.content, decryptionWarning: true };
        }
    }));
}
