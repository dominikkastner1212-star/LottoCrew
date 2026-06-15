"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

function parseAmount(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(String(value ?? fallback).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseNumber(value: FormDataEntryValue | null) {
  return Number(String(value ?? "").trim());
}

function assertEurojackpotNumbers(mainNumbers: number[], euroNumbers: number[]) {
  if (mainNumbers.length !== 5 || euroNumbers.length !== 2) {
    throw new Error("Eurojackpot braucht 5 Hauptzahlen und 2 Eurozahlen.");
  }

  if (new Set(mainNumbers).size !== mainNumbers.length || new Set(euroNumbers).size !== euroNumbers.length) {
    throw new Error("Zahlen duerfen sich innerhalb eines Tippfelds nicht doppeln.");
  }

  if (mainNumbers.some((number) => !Number.isInteger(number) || number < 1 || number > 50)) {
    throw new Error("Hauptzahlen muessen zwischen 1 und 50 liegen.");
  }

  if (euroNumbers.some((number) => !Number.isInteger(number) || number < 1 || number > 12)) {
    throw new Error("Eurozahlen muessen zwischen 1 und 12 liegen.");
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
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

export async function createDraw(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const drawDate = String(formData.get("draw_date") ?? "");
  const jackpotAmount = parseAmount(formData.get("jackpot_amount"));

  await assertAdmin(supabase, userId, groupId);

  if (!drawDate) {
    throw new Error("Ziehungsdatum fehlt.");
  }

  await supabase
    .from("draws")
    .insert({
      group_id: groupId,
      lottery_type: "eurojackpot",
      draw_date: drawDate,
      jackpot_amount: jackpotAmount,
      status: "planned",
      created_by: userId,
    })
    .throwOnError();

  revalidatePath("/");
  revalidatePath("/ziehungen");
  revalidatePath("/tipps");
}

export async function createTicket(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const drawId = String(formData.get("draw_id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const stakeAmount = parseAmount(formData.get("stake_amount"));
  const mainNumbers = [1, 2, 3, 4, 5].map((position) => parseNumber(formData.get(`main_${position}`)));
  const euroNumbers = [1, 2].map((position) => parseNumber(formData.get(`extra_${position}`)));

  await assertAdmin(supabase, userId, groupId);
  assertEurojackpotNumbers(mainNumbers, euroNumbers);

  if (!drawId || !label) {
    throw new Error("Tippname und Ziehung sind erforderlich.");
  }

  const { data: ticket } = await supabase
    .from("tickets")
    .insert({
      group_id: groupId,
      draw_id: drawId,
      label,
      status: "submitted",
      stake_amount: stakeAmount,
      submitted_at: new Date().toISOString(),
      created_by: userId,
    })
    .select("id")
    .single()
    .throwOnError();

  await supabase
    .from("ticket_numbers")
    .insert([
      ...mainNumbers.map((number, index) => ({
        ticket_id: ticket.id,
        position: index + 1,
        kind: "main",
        number,
      })),
      ...euroNumbers.map((number, index) => ({
        ticket_id: ticket.id,
        position: index + 1,
        kind: "extra",
        number,
      })),
    ])
    .throwOnError();

  await supabase.from("draws").update({ status: "submitted", updated_at: new Date().toISOString() }).eq("id", drawId).eq("group_id", groupId);

  revalidatePath("/");
  revalidatePath("/tipps");
  revalidatePath("/ziehungen");
}

export async function createPayment(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const memberId = String(formData.get("member_id") ?? "");
  const dueMonth = String(formData.get("due_month") ?? "");
  const amount = parseAmount(formData.get("amount"));

  await assertAdmin(supabase, userId, groupId);

  if (!memberId || !dueMonth) {
    throw new Error("Mitglied und Monat sind erforderlich.");
  }

  await supabase
    .from("payments")
    .upsert(
      {
        group_id: groupId,
        member_id: memberId,
        due_month: `${dueMonth}-01`,
        amount,
        status: "open",
      },
      { onConflict: "member_id,due_month" },
    )
    .throwOnError();

  revalidatePath("/");
  revalidatePath("/zahlungen");
}

export async function createWinning(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const drawId = String(formData.get("draw_id") ?? "");
  const ticketId = String(formData.get("ticket_id") ?? "");
  const amount = parseAmount(formData.get("amount"));
  const prizeRank = String(formData.get("prize_rank") ?? "").trim();

  await assertAdmin(supabase, userId, groupId);

  if (!drawId || !ticketId) {
    throw new Error("Ziehung und Tipp sind erforderlich.");
  }

  await supabase
    .from("winnings")
    .insert({
      group_id: groupId,
      draw_id: drawId,
      ticket_id: ticketId,
      amount,
      prize_rank: prizeRank || "Gewinn",
      recorded_by: userId,
    })
    .throwOnError();

  await Promise.all([
    supabase.from("tickets").update({ status: "evaluated", updated_at: new Date().toISOString() }).eq("id", ticketId).eq("group_id", groupId),
    supabase.from("draws").update({ status: "evaluated", updated_at: new Date().toISOString() }).eq("id", drawId).eq("group_id", groupId),
  ]);

  revalidatePath("/");
  revalidatePath("/gewinne");
  revalidatePath("/statistiken");
  revalidatePath("/tipps");
  revalidatePath("/ziehungen");
}
