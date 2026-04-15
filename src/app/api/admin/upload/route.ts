import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "manager")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const bucket = formData.get("bucket") as string | null;

  if (!file || !bucket) {
    return NextResponse.json({ error: "Missing file or bucket" }, { status: 400 });
  }

  const allowed = ["offers", "content", "staff", "services"];
  if (!allowed.includes(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  const customPath = formData.get("path") as string | null;
  const prevPath   = formData.get("prevPath") as string | null;

  // Delete previous file first (handles extension changes — no orphaned files)
  if (prevPath) {
    await supabaseAdmin.storage.from(bucket).remove([prevPath]);
  }

  const ext = file.name.split(".").pop();
  const fileName = customPath ?? `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, buffer, { contentType: file.type, upsert: !!customPath });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl });
}
