import { NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/db";

export async function GET() {
  try {
    const pool = getDatabasePool();
    // Lightweight database ping query
    await pool.query("SELECT 1;");

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch {
    // Do not expose database connection details or stack traces to clients
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
