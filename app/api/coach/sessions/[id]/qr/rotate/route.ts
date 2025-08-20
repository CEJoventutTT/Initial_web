import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getOrigin() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function getUserFromCookiesOrAuthHeader() {
  // 1) Intento con cookies (sesión del navegador)
  const store = await cookies();
  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          store.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          store.delete({ name, ...options });
        },
      },
    }
  );
  const { data: cData } = await supa.auth.getUser();
  if (cData?.user) return { user: cData.user, mode: "cookies" as const };

  // 2) Fallback: Authorization: Bearer <token>
  const auth = headers().get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { user: null, mode: "none" as const };

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  // Valida el access token
  const { data: aData, error: aErr } = await admin.auth.getUser(token);
  if (aErr || !aData?.user) return { user: null, mode: "auth_header_invalid" as const };

  return { user: aData.user, mode: "auth_header" as const };
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const sessionId = Number(id);
    if (!Number.isFinite(sessionId)) {
      return NextResponse.json({ error: "invalid_id" }, { status: 400 });
    }

    const { user, mode } = await getUserFromCookiesOrAuthHeader();
    if (!user) {
      return NextResponse.json(
        { error: "unauthorized", detail: `no_user_${mode}` },
        { status: 401 }
      );
    }

    // (Opcional) aquí puedes comprobar que user.role === 'coach' en tu tabla

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Asegura que existe la sesión
    const { data: existing, error: getErr } = await admin
      .from("attendance_sessions")
      .select("id")
      .eq("id", sessionId)
      .single();

    if (getErr || !existing) {
      return NextResponse.json({ error: "session_not_found" }, { status: 404 });
    }

    const newKey = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

    const { data, error } = await admin
      .from("attendance_sessions")
      .update({ qr_key: newKey, expires_at: expiresAt, active: true })
      .eq("id", sessionId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "rotate_failed", detail: error?.message },
        { status: 500 }
      );
    }

    const origin = getOrigin();
    const attendUrl = `${origin}/attend?s=${data.id}&k=${data.qr_key}`;

    return NextResponse.json({
      ok: true,
      mode: "rotated",
      session: { id: data.id, expires_at: data.expires_at },
      attendUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "exception", detail: e?.message },
      { status: 500 }
    );
  }
}
