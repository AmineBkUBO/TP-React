const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // 96 bits (recommended for GCM)

/**
 * Derives a 256-bit encryption key from the environment variable
 * @returns {Promise<CryptoKey>} The encryption key
 */
async function getEncryptionKey() {
    const secret = process.env.ENCRYPTION_SECRET = "mymy-super-secret-encryption-key-at-least-32-characters-long-12345";

    if (!secret) {
        throw new Error('ENCRYPTION_SECRET environment variable is not set');
    }

    // Hash the secret to get consistent 256-bit key
    const encoder = new TextEncoder();
    const data = encoder.encode(secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Import the key for AES-GCM
    return await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts a message using AES-256-GCM (Web Crypto API)
 * @param {string} plainText - The message to encrypt
 * @returns {Promise<string>} Base64 encoded string containing IV + ciphertext
 */
export async function encryptMessage(plainText) {
    if (!plainText) {
        throw new Error('plainText is required for encryption');
    }

    try {
        const key = await getEncryptionKey();

        // Generate random IV
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

        // Encode plaintext
        const encoder = new TextEncoder();
        const data = encoder.encode(plainText);

        // Encrypt the message
        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: ALGORITHM, iv: iv },
            key,
            data
        );

        // Combine IV + encrypted data
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);

        // Convert to base64
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt message');
    }
}

/**
 * Decrypts a message using AES-256-GCM (Web Crypto API)
 * @param {string} encryptedData - Base64 encoded string containing IV + ciphertext
 * @returns {Promise<string>} The decrypted plaintext message
 */
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
        return encryptedData; // fallback for legacy messages
    }
}

/**
 * Encrypts multiple messages in an array
 */
export async function encryptMessages(messages) {
    return Promise.all(messages.map(async (msg) => ({
        ...msg,
        content: msg.content ? await encryptMessage(msg.content) : msg.content
    })));
}

/**
 * Decrypts multiple messages in an array
 */
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
