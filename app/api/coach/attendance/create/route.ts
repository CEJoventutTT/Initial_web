import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey);
    const { programId } = await req.json();
    if (!programId) return NextResponse.json({ error: "programId requerido" }, { status: 400 });

    const key = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

    const { data, error } = await supabase
      .from("attendance_sessions")
      .insert({ program_id: programId, qr_key: key, active: true, expires_at: expiresAt })
      .select()
      .single();

    if (error || !data) return NextResponse.json({ error: error?.message || "No se pudo crear" }, { status: 500 });

    return NextResponse.json({ ok: true, session: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
