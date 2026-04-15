import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

export async function GET() {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("staff")
    .select(`
      id, bio, specialization, location_id,
      profiles!staff_id_fkey(email, role, first_name, last_name, name, avatar_url),
      locations(name)
    `)
    .order("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten nested profile and location fields
  const flattened = (data ?? []).map((s: any) => {
    const p = s.profiles ?? {};
    const displayName = p.first_name
      ? `${p.first_name} ${p.last_name ?? ""}`.trim()
      : p.name ?? null;
    return {
      id:             s.id,
      name:           displayName,
      bio:            s.bio,
      specialization: s.specialization,
      avatar_url:     p.avatar_url ?? null,
      location_id:    s.location_id,
      location_name:  s.locations?.name ?? null,
      email:          p.email ?? null,
      role:           p.role ?? "employee",
      first_name:     p.first_name ?? null,
      last_name:      p.last_name ?? null,
    };
  });

  return NextResponse.json({ data: flattened });
}

export async function POST(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name, role, locationId, mode, redirectTo } = await request.json();

  if (!email || !role || !locationId || !mode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (mode === "link") {
    // Find existing profile by email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, first_name, last_name, name")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "No account found for this email. Ask the staff member to sign up first." }, { status: 404 });
    }

    // Check if already a staff member
    const { data: existing } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("id", profile.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "This user is already a staff member." }, { status: 409 });
    }

    await supabaseAdmin.from("profiles").update({ role, preferred_location_id: locationId }).eq("id", profile.id);
    const { error: insertError } = await supabaseAdmin.from("staff").insert({ id: profile.id, location_id: locationId });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  }

  // mode === "create": invite new user — creates account AND sends invite email
  if (!name) return NextResponse.json({ error: "Name is required when creating a new account" }, { status: 400 });

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: redirectTo ?? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
    data: {
      full_name: name,
      given_name: name.split(" ")[0],
      family_name: name.split(" ").slice(1).join(" "),
    },
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  const userId = authData.user.id;

  await supabaseAdmin.from("profiles").update({
    role,
    preferred_location_id: locationId,
    first_name: name.split(" ")[0],
    last_name:  name.split(" ").slice(1).join(" ") || null,
  }).eq("id", userId);

  const { error: staffError } = await supabaseAdmin.from("staff").insert({ id: userId, location_id: locationId });
  if (staffError) return NextResponse.json({ error: staffError.message }, { status: 500 });

  return NextResponse.json({ success: true, userId }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, role, locationId } = await request.json();

  // Update profile (role + location)
  const profileUpdates: Record<string, unknown> = {};
  if (role) profileUpdates.role = role;
  if (locationId !== undefined) profileUpdates.preferred_location_id = locationId;

  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabaseAdmin.from("profiles").update(profileUpdates).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update staff record (location only — name comes from profiles)
  const staffUpdates: Record<string, unknown> = {};
  if (locationId !== undefined) staffUpdates.location_id = locationId;

  if (Object.keys(staffUpdates).length > 0) {
    await supabaseAdmin.from("staff").update(staffUpdates).eq("id", userId);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await request.json();

  // Remove staff record
  const { error: staffError } = await supabaseAdmin.from("staff").delete().eq("id", userId);
  if (staffError) return NextResponse.json({ error: staffError.message }, { status: 500 });

  // Downgrade profile role to customer
  const { error: profileError } = await supabaseAdmin.from("profiles").update({ role: "customer" }).eq("id", userId);
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
