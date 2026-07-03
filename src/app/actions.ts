"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDefaultDisplayName } from "@/lib/app-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/utils";

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

function parseIntegerList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/[,\s;]+/)
    .map((part) => Number(part.trim()))
    .filter((number) => Number.isInteger(number));
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

function getEurojackpotPrizeRank(mainMatches: number, euroMatches: number) {
  const key = `${mainMatches}+${euroMatches}`;
  const classes: Record<string, string> = {
    "5+2": "Gewinnklasse 1",
    "5+1": "Gewinnklasse 2",
    "5+0": "Gewinnklasse 3",
    "4+2": "Gewinnklasse 4",
    "4+1": "Gewinnklasse 5",
    "3+2": "Gewinnklasse 6",
    "4+0": "Gewinnklasse 7",
    "2+2": "Gewinnklasse 8",
    "3+1": "Gewinnklasse 9",
    "3+0": "Gewinnklasse 10",
    "1+2": "Gewinnklasse 11",
    "2+1": "Gewinnklasse 12",
  };

  return classes[key] ?? null;
}

function countMatches(ticketNumbers: number[], resultNumbers: number[]) {
  const resultSet = new Set(resultNumbers);
  return ticketNumbers.filter((number) => resultSet.has(number)).length;
}

async function assertActiveMember(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, groupId: string) {
  const { data } = await supabase
    .from("group_members")
    .select("id,role")
    .eq("group_id", groupId)
    .eq("profile_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (!data) {
    throw new Error("Du bist kein aktives Mitglied dieser Gruppe.");
  }

  return data;
}

async function insertTicket(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  payload: {
    groupId: string;
    drawId: string;
    label: string;
    stakeAmount: number;
    mainNumbers: number[];
    euroNumbers: number[];
  },
) {
  assertEurojackpotNumbers(payload.mainNumbers, payload.euroNumbers);

  if (!payload.drawId || !payload.label) {
    throw new Error("Tippname und Ziehung sind erforderlich.");
  }

  const { data: draw } = await supabase
    .from("draws")
    .select("id")
    .eq("id", payload.drawId)
    .eq("group_id", payload.groupId)
    .maybeSingle()
    .throwOnError();

  if (!draw) {
    throw new Error("Ziehung gehoert nicht zu dieser Gruppe.");
  }

  const { data: ticket } = await supabase
    .from("tickets")
    .insert({
      group_id: payload.groupId,
      draw_id: payload.drawId,
      label: payload.label,
      status: "submitted",
      stake_amount: payload.stakeAmount,
      submitted_at: new Date().toISOString(),
      created_by: userId,
    })
    .select("id")
    .single()
    .throwOnError();

  await supabase
    .from("ticket_numbers")
    .insert([
      ...payload.mainNumbers.map((number, index) => ({
        ticket_id: ticket.id,
        position: index + 1,
        kind: "main",
        number,
      })),
      ...payload.euroNumbers.map((number, index) => ({
        ticket_id: ticket.id,
        position: index + 1,
        kind: "extra",
        number,
      })),
    ])
    .throwOnError();

  await supabase
    .from("draws")
    .update({ status: "submitted", updated_at: new Date().toISOString() })
    .eq("id", payload.drawId)
    .eq("group_id", payload.groupId);
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
  revalidatePath("/");
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
      invite_code: generateInviteCode(),
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
  revalidatePath("/");
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
  revalidatePath("/");
}

export async function reactivateMember(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const memberId = String(formData.get("member_id") ?? "");

  await assertAdmin(supabase, userId, groupId);

  const admin = createAdminClient();
  await admin
    .from("group_members")
    .update({ status: "active" })
    .eq("id", memberId)
    .eq("group_id", groupId)
    .throwOnError();

  revalidatePath("/einstellungen");
  revalidatePath("/");
}

export async function deactivateMember(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const memberId = String(formData.get("member_id") ?? "");
  const memberProfileId = String(formData.get("profile_id") ?? "");

  await assertAdmin(supabase, userId, groupId);

  // Man kann sich nicht selbst deaktivieren.
  if (memberProfileId === userId) {
    throw new Error("Du kannst dich nicht selbst deaktivieren.");
  }

  const admin = createAdminClient();

  // Rolle des zu deaktivierenden Mitglieds ermitteln.
  const { data: target } = await admin
    .from("group_members")
    .select("role,status")
    .eq("id", memberId)
    .eq("group_id", groupId)
    .maybeSingle()
    .throwOnError();

  if (!target) {
    throw new Error("Mitglied nicht gefunden.");
  }

  // Den letzten aktiven Admin nicht deaktivieren, sonst sperrt sich die Gruppe aus.
  if (target.role === "admin") {
    const { count } = await admin
      .from("group_members")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupId)
      .eq("role", "admin")
      .eq("status", "active");

    if ((count ?? 0) <= 1) {
      throw new Error("Der letzte aktive Admin kann nicht deaktiviert werden.");
    }
  }

  await admin
    .from("group_members")
    .update({ status: "paused" })
    .eq("id", memberId)
    .eq("group_id", groupId)
    .throwOnError();

  revalidatePath("/einstellungen");
  revalidatePath("/");
}

export async function updateMemberEmail(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const memberProfileId = String(formData.get("profile_id") ?? "");
  const newEmail = String(formData.get("email") ?? "").trim().toLowerCase();

  await assertAdmin(supabase, userId, groupId);

  if (!newEmail.includes("@")) {
    throw new Error("Bitte eine gueltige E-Mail-Adresse eintragen.");
  }

  const admin = createAdminClient();

  // Sicherstellen, dass das Mitglied wirklich zu dieser Gruppe gehoert.
  const { data: membership } = await admin
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("profile_id", memberProfileId)
    .maybeSingle()
    .throwOnError();

  if (!membership) {
    throw new Error("Mitglied gehoert nicht zu dieser Gruppe.");
  }

  // Pruefen, ob die neue Adresse bereits von jemand anderem verwendet wird.
  const { data: clash } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", newEmail)
    .neq("id", memberProfileId)
    .maybeSingle()
    .throwOnError();

  if (clash) {
    throw new Error("Diese E-Mail wird bereits von einem anderen Konto verwendet.");
  }

  // Beide Stellen aktualisieren: Login-System (Auth) und Profil.
  const { error: authError } = await admin.auth.admin.updateUserById(memberProfileId, {
    email: newEmail,
    email_confirm: true,
  });

  if (authError) {
    throw authError;
  }

  await admin.from("profiles").update({ email: newEmail }).eq("id", memberProfileId).throwOnError();

  revalidatePath("/einstellungen");
  revalidatePath("/");
}

export async function addMemberWithPassword(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "participant");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();

  await assertAdmin(supabase, userId, groupId);

  if (!email.includes("@")) {
    throw new Error("Bitte eine gueltige E-Mail-Adresse eintragen.");
  }

  if (password.length < 6) {
    throw new Error("Das Startpasswort muss mindestens 6 Zeichen haben.");
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

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle()
    .throwOnError();

  if (existingProfile?.id) {
    throw new Error("Fuer diese E-Mail gibt es bereits ein Konto. Bitte den normalen Einladungsweg nutzen.");
  }

  // Konto direkt anlegen: E-Mail gilt sofort als bestaetigt (keine Mail noetig).
  // Das Flag must_change_password fuehrt den Kollegen beim ersten Login zum
  // Aendern des vom Admin vergebenen Startpassworts.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName || email.split("@")[0],
      must_change_password: true,
    },
  });

  if (createError) {
    throw createError;
  }

  const profileId = created.user?.id;

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
  revalidatePath("/");
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
  revalidatePath("/");
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
  revalidatePath("/kasse");
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
  await insertTicket(supabase, userId, { groupId, drawId, label, stakeAmount, mainNumbers, euroNumbers });

  revalidatePath("/");
  revalidatePath("/tipps");
  revalidatePath("/ziehungen");
}

export async function createMemberTicket(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const drawId = String(formData.get("draw_id") ?? "");
  const label = String(formData.get("label") ?? "Mein Eurojackpot-Tipp").trim();
  const stakeAmount = parseAmount(formData.get("stake_amount"), 2);
  const mainNumbers = [1, 2, 3, 4, 5].map((position) => parseNumber(formData.get(`main_${position}`)));
  const euroNumbers = [1, 2].map((position) => parseNumber(formData.get(`extra_${position}`)));

  await assertActiveMember(supabase, userId, groupId);
  await insertTicket(supabase, userId, { groupId, drawId, label, stakeAmount, mainNumbers, euroNumbers });

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
  revalidatePath("/kasse");
}

export async function createMonthlyPayments(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const dueMonth = String(formData.get("due_month") ?? "");

  await assertAdmin(supabase, userId, groupId);

  if (!dueMonth) {
    throw new Error("Monat ist erforderlich.");
  }

  const { data: group } = await supabase
    .from("groups")
    .select("monthly_amount")
    .eq("id", groupId)
    .single()
    .throwOnError();

  const { data: members } = await supabase
    .from("group_members")
    .select("id,monthly_amount")
    .eq("group_id", groupId)
    .eq("status", "active")
    .throwOnError();

  const paymentRows = (members ?? []).map((member) => ({
    group_id: groupId,
    member_id: member.id,
    due_month: `${dueMonth}-01`,
    amount: member.monthly_amount ?? group?.monthly_amount ?? 24,
    status: "open",
  }));

  if (paymentRows.length) {
    await supabase
      .from("payments")
      .upsert(paymentRows, { onConflict: "member_id,due_month" })
      .throwOnError();
  }

  revalidatePath("/");
  revalidatePath("/kasse");
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

  // Entfernt einen eventuell von der automatischen Auswertung angelegten
  // Platzhalter (source "auto", Betrag 0) fuer denselben Tipp, damit der
  // manuell erfasste Betrag ihn ersetzt statt einen Doppeleintrag zu erzeugen.
  await supabase
    .from("winnings")
    .delete()
    .eq("group_id", groupId)
    .eq("draw_id", drawId)
    .eq("ticket_id", ticketId)
    .eq("source", "auto");

  await supabase
    .from("winnings")
    .insert({
      group_id: groupId,
      draw_id: drawId,
      ticket_id: ticketId,
      amount,
      prize_rank: prizeRank || "Gewinn",
      source: "manual",
      recorded_by: userId,
    })
    .throwOnError();

  await Promise.all([
    supabase.from("tickets").update({ status: "evaluated", updated_at: new Date().toISOString() }).eq("id", ticketId).eq("group_id", groupId),
    supabase.from("draws").update({ status: "evaluated", updated_at: new Date().toISOString() }).eq("id", drawId).eq("group_id", groupId),
  ]);

  revalidatePath("/");
  revalidatePath("/kasse");
  revalidatePath("/");
  revalidatePath("/tipps");
  revalidatePath("/ziehungen");
}

export async function evaluateDraw(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const drawId = String(formData.get("draw_id") ?? "");
  const mainNumbers = parseIntegerList(formData.get("result_numbers"));
  const euroNumbers = parseIntegerList(formData.get("result_extra_numbers"));

  await assertAdmin(supabase, userId, groupId);
  assertEurojackpotNumbers(mainNumbers, euroNumbers);

  if (!drawId) {
    throw new Error("Ziehung fehlt.");
  }

  const { data: tickets } = await supabase
    .from("tickets")
    .select("id")
    .eq("group_id", groupId)
    .eq("draw_id", drawId)
    .throwOnError();

  const ticketIds = (tickets ?? []).map((ticket) => ticket.id);
  const { data: numberRows } = ticketIds.length
    ? await supabase
        .from("ticket_numbers")
        .select("ticket_id,kind,number")
        .in("ticket_id", ticketIds)
        .throwOnError()
    : { data: [] };

  const numbersByTicket = new Map<string, { main: number[]; extra: number[] }>();
  (numberRows ?? []).forEach((row) => {
    const current = numbersByTicket.get(row.ticket_id) ?? { main: [], extra: [] };
    if (row.kind === "main") {
      current.main.push(Number(row.number));
    } else {
      current.extra.push(Number(row.number));
    }
    numbersByTicket.set(row.ticket_id, current);
  });

  await supabase
    .from("draws")
    .update({
      result_numbers: mainNumbers,
      result_extra_numbers: euroNumbers,
      status: "evaluated",
      updated_at: new Date().toISOString(),
    })
    .eq("id", drawId)
    .eq("group_id", groupId)
    .throwOnError();

  await supabase.from("winnings").delete().eq("group_id", groupId).eq("draw_id", drawId).eq("source", "auto");

  // Tipps, fuer die bereits ein Betrag manuell erfasst wurde, bekommen keinen
  // Auto-Platzhalter mehr, damit die manuelle Eingabe nicht ueberschrieben oder
  // dupliziert wird.
  const { data: manualWinnings } = await supabase
    .from("winnings")
    .select("ticket_id")
    .eq("group_id", groupId)
    .eq("draw_id", drawId)
    .eq("source", "manual")
    .throwOnError();
  const manuallyRecorded = new Set((manualWinnings ?? []).map((row) => row.ticket_id));

  const automaticWinnings: Array<{
    group_id: string;
    draw_id: string;
    ticket_id: string;
    amount: number;
    prize_rank: string;
    source: "auto";
    recorded_by: string;
  }> = [];
  for (const ticket of tickets ?? []) {
    const ticketNumbers = numbersByTicket.get(ticket.id) ?? { main: [], extra: [] };
    const mainMatches = countMatches(ticketNumbers.main, mainNumbers);
    const euroMatches = countMatches(ticketNumbers.extra, euroNumbers);
    const prizeRank = getEurojackpotPrizeRank(mainMatches, euroMatches);

    await supabase
      .from("tickets")
      .update({
        main_matches: mainMatches,
        euro_matches: euroMatches,
        prize_rank: prizeRank,
        evaluated_at: new Date().toISOString(),
        status: "evaluated",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticket.id)
      .eq("group_id", groupId)
      .throwOnError();

    if (prizeRank && !manuallyRecorded.has(ticket.id)) {
      automaticWinnings.push({
        group_id: groupId,
        draw_id: drawId,
        ticket_id: ticket.id,
        amount: 0,
        prize_rank: `${prizeRank} (${mainMatches}+${euroMatches})`,
        source: "auto",
        recorded_by: userId,
      });
    }
  }

  // Optional beim Auswerten direkt den Gesamtgewinn erfassen: Er wird
  // centgenau auf die erkannten Gewinn-Tipps verteilt (Reihenfolge egal,
  // da am Ende ohnehin alles gleichmaessig durch alle Mitglieder geht).
  const totalAmount = parseAmount(formData.get("total_amount"));

  if (totalAmount > 0) {
    if (automaticWinnings.length === 0) {
      throw new Error(
        "Es wurde ein Gewinnbetrag angegeben, aber kein Tipp hat laut Zahlen eine Gewinnklasse erreicht. Bitte Zahlen pruefen.",
      );
    }

    const totalCents = Math.round(totalAmount * 100);
    const baseCents = Math.floor(totalCents / automaticWinnings.length);
    let remainder = totalCents - baseCents * automaticWinnings.length;

    for (const winning of automaticWinnings) {
      let cents = baseCents;
      if (remainder > 0) {
        cents += 1;
        remainder -= 1;
      }
      winning.amount = cents / 100;
    }
  }

  if (automaticWinnings.length) {
    await supabase.from("winnings").insert(automaticWinnings).throwOnError();
  }

  revalidatePath("/");
  revalidatePath("/kasse");
  revalidatePath("/");
  revalidatePath("/tipps");
  revalidatePath("/ziehungen");
}

export async function uploadTicketDocument(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const groupId = String(formData.get("group_id") ?? "");
  const ticketId = String(formData.get("ticket_id") ?? "");
  const file = formData.get("file");

  await assertAdmin(supabase, userId, groupId);

  if (!ticketId || !(file instanceof File) || file.size === 0) {
    throw new Error("Bitte einen Spielschein auswaehlen.");
  }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "") || "spielschein";
  const path = `${groupId}/${ticketId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from("ticket-documents")
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  await supabase
    .from("tickets")
    .update({ ticket_image_path: path, updated_at: new Date().toISOString() })
    .eq("id", ticketId)
    .eq("group_id", groupId)
    .throwOnError();

  revalidatePath("/tipps");
  revalidatePath("/ziehungen");
}
