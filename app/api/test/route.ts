export async function GET() {
    return Response.json({
        exists: !!process.env.NEXT_PUBLIC_APP_NAME,
        value: process.env.NEXT_PUBLIC_APP_NAME
            ? "DEFINED" + process.env.NEXT_PUBLIC_APP_NAME
            : "UNDEFINED",
    });
}