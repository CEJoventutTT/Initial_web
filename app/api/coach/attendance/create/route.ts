import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  authenticatedSupabase,
  canManageProgram,
  hasRole,
} from "@/lib/supabase/request-auth";

export async function POST(req: Request) {
  try {
    const { supabase, user } = await authenticatedSupabase(req);
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!(await hasRole(supabase, user.id, ["coach", "admin"]))) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const { programId } = await req.json();
    const numericProgramId = Number(programId);
    if (!Number.isSafeInteger(numericProgramId) || numericProgramId <= 0) {
      return NextResponse.json({ error: "invalid_program_id" }, { status: 400 });
    }
    if (!(await canManageProgram(supabase, numericProgramId))) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const key = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

    const { data, error } = await supabase
      .from("attendance_sessions")
      .insert({ program_id: numericProgramId, qr_key: key, active: true, expires_at: expiresAt })
      .select("id, program_id, active, expires_at")
      .single();

    if (error || !data) return NextResponse.json({ error: "session_create_failed" }, { status: 400 });

    return NextResponse.json({ ok: true, session: data });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
