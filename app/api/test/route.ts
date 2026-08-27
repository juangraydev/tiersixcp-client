export async function GET() {
    return Response.json({
        exists: !!process.env.MSSQL_SERVER,
        value: process.env.MSSQL_SERVER
            ? "DEFINED" + process.env.MSSQL_SERVER
            : "UNDEFINED",
    });
}