import { handleUpload } from "@vercel/blob/client";

// The Request type annotation is removed from the function signature.
export async function POST(request) {
    const body = await request.json();

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname /*, clientPayload */) => {
                // Generate a client token for the browser to upload the file
                // Make sure to authenticate and authorize users before generating the token.
                // Otherwise, you're allowing anonymous uploads.

                return {
                    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
                    addRandomSuffix: true,
                    // callbackUrl: 'https://example.com/api/avatar/upload',
                    // optional, `callbackUrl` is automatically computed when hosted on Vercel
                    tokenPayload: JSON.stringify({
                        // optional, sent to your server on upload completion
                        // you could pass a user id from auth, or a value from clientPayload
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Called by Vercel API on client upload completion
                // Use tools like ngrok if you want this to work locally

                console.log("blob upload completed", blob, tokenPayload);

                try {
                    // Run any logic after the file upload completed
                    // const { userId } = JSON.parse(tokenPayload);
                    // await db.update({ avatar: blob.url, userId });
                } catch (error) {
                    // The error is handled without a TypeScript type assertion
                    throw new Error("Could not update user");
                }
            },
        });

        return Response.json(jsonResponse);
    } catch (error) {
        // Removed `(error as Error)` type casting
        return Response.json(
            { error: error.message },
            { status: 400 }, // The webhook will retry 5 times waiting for a 200
        );
    }
}
