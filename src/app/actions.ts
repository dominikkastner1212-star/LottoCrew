"use server";

import { revalidatePath } from "next/cache";
import { getDefaultDisplayName } from "@/lib/app-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Nicht angemeldet.");
  }

  return { supabase, userId: user.id, email: user.email ?? "" };
}

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, groupId: string) {
  const { data } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("profile_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (data?.role !== "admin") {
    throw new Error("Nur Admins duerfen diese Aktion ausfuehren.");
  }
}

export async function updateProfile(formData: FormData) {
  const { supabase, userId, email } = await getUserId();
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!displayName) {
    throw new Error("Name darf nicht leer sein.");
  }

  await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email,
      display_name: displayName,
      updated_at: new Date().toISOString(),
    })
    .throwOnError();

  revalidatePath("/");
  revalidatePath("/einstellungen");
  revalidatePath("/teilnehmer");
}

export async function createInitialGroup(formData: FormData) {
  const { supabase, userId, email } = await getUserId();
  const name = String(formData.get("name") ?? "AbteilungsJackpot").trim();
  const monthlyAmount = Number(String(formData.get("monthly_amount") ?? "24").replace(",", "."));
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "abteilungsjackpot";

  await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email,
      display_name: getDefaultDisplayName(email, "Admin"),
    })
    .throwOnError();

  const { data: group } = await supabase
    .from("groups")
    .insert({
      name,
      slug: `${slug}-${userId.slice(0, 8)}`,
      monthly_amount: Number.isFinite(monthlyAmount) ? monthlyAmount : 24,
      created_by: userId,
    })
    .select("id")
    .single()
    .throwOnError();

  await supabase
    .from("group_members")
    .insert({
      group_id: group.id,
      profile_id: userId,
      role: "admin",
      status: "active",
      monthly_amount: Number.isFinite(monthlyAmount) ? monthlyAmount : 24,
    })
    .throwOnError();

  revalidatePath("/");
  revalidatePath("/einstellungen");
}

export async function updateGroupSettings(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const monthlyAmount = Number(String(formData.get("monthly_amount") ?? "0").replace(",", "."));

  await assertAdmin(supabase, userId, groupId);

  await supabase
    .from("groups")
    .update({
      name,
      monthly_amount: Number.isFinite(monthlyAmount) ? monthlyAmount : 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", groupId)
    .throwOnError();

  revalidatePath("/");
  revalidatePath("/einstellungen");
  revalidatePath("/teilnehmer");
}

export async function updateMemberRole(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const memberId = String(formData.get("member_id") ?? "");
  const targetProfileId = String(formData.get("profile_id") ?? "");
  const role = String(formData.get("role") ?? "participant");

  await assertAdmin(supabase, userId, groupId);

  if (targetProfileId === userId && role !== "admin") {
    throw new Error("Du kannst dir deine eigenen Admin-Rechte nicht entziehen.");
  }

  if (role !== "admin" && role !== "participant") {
    throw new Error("Ungueltige Rolle.");
  }

  await supabase.from("group_members").update({ role }).eq("id", memberId).eq("group_id", groupId).throwOnError();

  revalidatePath("/einstellungen");
  revalidatePath("/teilnehmer");
}

export async function addMemberByEmail(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "participant");

  await assertAdmin(supabase, userId, groupId);

  if (!email.includes("@")) {
    throw new Error("Bitte eine gueltige E-Mail-Adresse eintragen.");
  }

  if (role !== "admin" && role !== "participant") {
    throw new Error("Ungueltige Rolle.");
  }

  const admin = createAdminClient();
  const { data: group } = await admin
    .from("groups")
    .select("monthly_amount")
    .eq("id", groupId)
    .single()
    .throwOnError();

  const { data: profile } = await admin
    .from("profiles")
    .select("id,email")
    .ilike("email", email)
    .maybeSingle()
    .throwOnError();

  let profileId = profile?.id;

  if (!profileId) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/^["']|["']$/g, "");
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: appUrl ? `${appUrl}/auth/confirm` : undefined,
    });

    if (error) {
      throw error;
    }

    profileId = data.user?.id;
  }

  if (!profileId) {
    throw new Error("Mitglied konnte nicht angelegt werden.");
  }

  await admin
    .from("group_members")
    .upsert(
      {
        group_id: groupId,
        profile_id: profileId,
        role,
        status: "active",
        monthly_amount: group?.monthly_amount ?? 24,
      },
      { onConflict: "group_id,profile_id" },
    )
    .throwOnError();

  revalidatePath("/einstellungen");
  revalidatePath("/teilnehmer");
}

export async function updatePaymentStatus(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const paymentId = String(formData.get("payment_id") ?? "");
  const status = String(formData.get("status") ?? "open");

  await assertAdmin(supabase, userId, groupId);

  await supabase
    .from("payments")
    .update({
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
      checked_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .eq("group_id", groupId)
    .throwOnError();

  revalidatePath("/");
  revalidatePath("/zahlungen");
}
