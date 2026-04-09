import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

export async function GET() {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, name, first_name, last_name, email, role, preferred_location_id, avatar_url, locations!profiles_preferred_location_id_fkey(name)")
    .in("role", ["employee", "manager", "super_admin"])
    .order("role")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const staffData = await supabaseAdmin
    .from("staff")
    .select("id, name, bio, specialization, image_url, location_id");

  return NextResponse.json({ data, staffData: staffData.data });
}

// POST: create a new employee/manager account
export async function POST(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name, role, locationId, specialization, bio } = await request.json();
  if (!email || !name || !role || !locationId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Create auth user (sends invite/magic link email)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: name, given_name: name.split(" ")[0], family_name: name.split(" ").slice(1).join(" ") },
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  const userId = authData.user.id;

  // Update profile with role and location
  await supabaseAdmin
    .from("profiles")
    .update({ role, preferred_location_id: locationId, name })
    .eq("id", userId);

  // Determine which location this staff member belongs to for the staff table
  const locationData = await supabaseAdmin.from("locations").select("id").eq("id", locationId).single();

  // Create staff record
  if (locationData.data) {
    await supabaseAdmin.from("staff").insert({
      name,
      bio: bio ?? null,
      specialization: specialization ?? null,
      location_id: locationId,
    });
  }

  // Send password reset (so they can set their own password)
  await supabaseAdmin.auth.admin.generateLink({ type: "recovery", email });

  return NextResponse.json({ success: true, userId }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, role, locationId, ...profileUpdates } = await request.json();
  const updates: Record<string, unknown> = { ...profileUpdates };
  if (role) updates.role = role;
  if (locationId !== undefined) updates.preferred_location_id = locationId;

  const { error } = await supabaseAdmin.from("profiles").update(updates).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await request.json();

  // Downgrade to customer role (soft delete — don't delete auth user)
  const { error } = await supabaseAdmin.from("profiles").update({ role: "customer" }).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
