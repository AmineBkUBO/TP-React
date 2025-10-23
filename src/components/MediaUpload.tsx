import React, { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import {PutBlobResult} from "@vercel/blob";

const AvatarUploadPage: React.FC = () => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [blob, setBlob] = useState<PutBlobResult | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileRef.current?.files?.length) return alert("Select a file first.");

        const file = fileRef.current.files[0];
        setUploading(true);

        try {
            const newBlob = await upload(file.name, file, {
                access: "public",
                handleUploadUrl: "http://localhost:3000/api/MediaUpload",
            });
            setBlob(newBlob);
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload failed! Check console for details.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ fontFamily: "sans-serif", padding: 20 }}>
            <h2>Upload Avatar</h2>
            <form onSubmit={handleSubmit}>
                <input ref={fileRef} type="file" accept="image/*" />
                <button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload"}
                </button>
            </form>

            {blob && (
                <div style={{ marginTop: 10 }}>
                    ✅ Uploaded:{" "}
                    <a href={blob.url} target="_blank" rel="noopener noreferrer">
                        {blob.url}
                    </a>
                </div>
            )}
        </div>
    );
};

export default AvatarUploadPage;
