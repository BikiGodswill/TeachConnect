import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (
    !["incident", "report"].includes(b.kind) ||
    !/^[0-9a-f-]{36}$/i.test(b.id || "") ||
    typeof b.status !== "string"
  ) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { error } = await createAdminClient().rpc("review_safety_item", {
    p_kind: b.kind,
    p_id: b.id,
    p_admin: admin.id,
    p_status: b.status,
    p_note: String(b.note || "").slice(0, 500),
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
