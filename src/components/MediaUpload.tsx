import React, { useRef, useState } from "react";
// Removed: import { upload } from "@vercel/blob/client";
// Removed: import { PutBlobResult } from "@vercel/blob";

// Define a simple type for the upload result since PutBlobResult cannot be imported
type UploadResult = {
    url: string;
};

const AvatarUploadPage: React.FC = () => {
    const fileRef = useRef<HTMLInputElement>(null);
    // Using the simplified type
    const [blob, setBlob] = useState<UploadResult | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Safety check on file input element
        if (!fileRef.current || !fileRef.current.files?.length) {
            alert("Select a file first.");
            return;
        }

        const file = fileRef.current.files[0];
        setUploading(true);

        try {
            // 1️⃣ Step 1: Request a signed upload URL from your serverless function
            // The server is expected to return { url: signedUrl, pathname: string }
            const res = await fetch("http://localhost:3000/api/MediaUpload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Sending filename and content type to the server for token generation
                body: JSON.stringify({ filename: file.name, contentType: file.type }),
            });

            if (!res.ok) {
                // Read error message from server if possible, otherwise use a generic message
                const errorText = await res.text();
                throw new Error(`Failed to get upload URL: ${errorText}`);
            }

            // Destructure the signed URL (which contains query params)
            const { url: signedUrl, pathname } = await res.json();

            // 2️⃣ Step 2: Upload the file directly to Vercel Blob using the signed URL (PUT)
            const uploadRes = await fetch(signedUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!uploadRes.ok) {
                throw new Error("Failed to upload file to storage.");
            }

            // 3️⃣ Step 3: Determine the final public URL
            // The public URL is the signed URL without the query parameters
            const finalUrl = signedUrl.split("?")[0];

            // Set the result object with the final URL
            setBlob({ url: finalUrl });

        } catch (err) {
            console.error("Upload failed:", err);
            // Using error.message safely
            alert(`Upload failed! Check console for details: ${err instanceof Error ? err.message : 'Unknown Error'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ fontFamily: "sans-serif", padding: 20, maxWidth: 600, margin: 'auto', backgroundColor: '#f9fafb', borderRadius: 8 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 20 }}>File Uploader (Manual Fetch)</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 10, border: '1px solid #e5e7eb', borderRadius: 6, backgroundColor: 'white' }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ flexGrow: 1 }} />
                <button
                    type="submit"
                    disabled={uploading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: uploading ? '#9ca3af' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                    }}
                >
                    {uploading ? "Uploading..." : "Upload File"}
                </button>
            </form>

            {blob && (
                <div style={{ marginTop: 20, padding: 15, backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: 6 }}>
                    <p style={{ fontWeight: 'bold', color: '#065f46' }}>✅ Upload Successful</p>
                    <a
                        href={blob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#10b981', textDecoration: 'underline', wordBreak: 'break-all' }}
                    >
                        {blob.url}
                    </a>
                </div>
            )}

            <p style={{ marginTop: 30, color: '#6b7280' }}>Reference Image:</p>
            <img
                src="https://utwtvreuqgpivwxp.public.blob.vercel-storage.com/Wallpaper%20Volvo%20Fh16%20Fh%20Fn16-j9xnSpyAmgykwCZxzpRzzyWjTlKnlU.jpg"
                alt="Volvo FH16 truck wallpaper"
                style={{ width: '100%', height: 'auto', borderRadius: 6, marginTop: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
        </div>
    );
};

export default AvatarUploadPage;
