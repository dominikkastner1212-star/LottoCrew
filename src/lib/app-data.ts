import { createClient } from "@/lib/supabase/server";

export type AppProfile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

export type AppGroup = {
  id: string;
  name: string;
  monthlyAmount: number;
  currency: string;
};

export type AppMembership = {
  id: string;
  role: "admin" | "participant";
  status: string;
  groupId: string;
  monthlyAmount: number | null;
};

export type AppMember = {
  id: string;
  profileId: string;
  name: string;
  email: string;
  role: "admin" | "participant";
  status: string;
  monthlyAmount: number;
  joinedAt: string;
};

export type AppDraw = {
  id: string;
  date: string;
  jackpot: number;
  status: string;
  resultNumbers: number[];
  resultEuroNumbers: number[];
};

export type AppTicket = {
  id: string;
  label: string;
  status: string;
  drawId: string;
  date: string | null;
  numbers: number[];
  euroNumbers: number[];
  stake: number;
  winnings: number;
  createdBy: string | null;
  mainMatches: number;
  euroMatches: number;
  prizeRank: string | null;
  imagePath: string | null;
  imageUrl: string | null;
};

export type AppPayment = {
  id: string;
  memberId: string;
  member: string;
  month: string;
  amount: number;
  status: "open" | "paid";
  paidAt: string | null;
};

export type AppWinning = {
  id: string;
  date: string;
  ticket: string;
  amount: number;
  perMember: number;
  rank: string;
};

export type MonthlyStat = {
  month: string;
  stake: number;
  winnings: number;
};

export type AppContext = {
  userId: string | null;
  profile: AppProfile | null;
  group: AppGroup | null;
  membership: AppMembership | null;
  isAdmin: boolean;
  members: AppMember[];
  draws: AppDraw[];
  tickets: AppTicket[];
  payments: AppPayment[];
  winnings: AppWinning[];
  monthlyStats: MonthlyStat[];
  totals: {
    activeMembers: number;
    totalStake: number;
    openPayments: number;
    lastWinnings: number;
    totalWinnings: number;
  };
};

export function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

export function getDefaultDisplayName(email: string | null | undefined, fallback = "Mitglied") {
  return email?.split("@")[0] || fallback;
}

function getProfileName(profile: Record<string, unknown> | null | undefined) {
  const displayName = profile?.display_name;
  const email = profile?.email;
  if (typeof displayName === "string" && displayName.length > 0) {
    return displayName;
  }
  if (typeof email === "string" && email.length > 0) {
    return getDefaultDisplayName(email);
  }
  return "Mitglied";
}

function monthLabel(value: string) {
  return new Intl.DateTimeFormat("de-DE", { month: "short", year: "numeric" }).format(new Date(value));
}

function toRole(value: unknown): "admin" | "participant" {
  return value === "admin" ? "admin" : "participant";
}

function toPaymentStatus(value: unknown): "open" | "paid" {
  return value === "paid" ? "paid" : "open";
}

function buildMonthlyStats(payments: AppPayment[], winnings: AppWinning[]) {
  const months = new Map<string, MonthlyStat>();

  payments.forEach((payment) => {
    const key = payment.month.slice(0, 7);
    const current = months.get(key) ?? { month: monthLabel(`${key}-01`), stake: 0, winnings: 0 };
    current.stake += payment.amount;
    months.set(key, current);
  });

  winnings.forEach((winning) => {
    const key = winning.date.slice(0, 7);
    const current = months.get(key) ?? { month: monthLabel(`${key}-01`), stake: 0, winnings: 0 };
    current.winnings += winning.amount;
    months.set(key, current);
  });

  return Array.from(months.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, value]) => value);
}

async function ensureProfile(supabase: Awaited<ReturnType<typeof createClient>>, user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
  const metadataDisplayName = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name.trim() : "";
  const displayName = metadataDisplayName || getDefaultDisplayName(user.email);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,display_name,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    if (!profile.display_name || profile.display_name === profile.email?.split("@")[0] || metadataDisplayName) {
      const { data: updated } = await supabase
        .from("profiles")
        .update({
          email: user.email ?? profile.email,
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select("id,email,display_name,avatar_url")
        .single();

      if (updated) {
        return {
          id: updated.id,
          email: updated.email,
          displayName: updated.display_name,
          avatarUrl: updated.avatar_url,
        };
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
    };
  }

  const { data: inserted } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? "",
      display_name: displayName,
    })
    .select("id,email,display_name,avatar_url")
    .single();

  return inserted
    ? {
        id: inserted.id,
        email: inserted.email,
        displayName: inserted.display_name,
        avatarUrl: inserted.avatar_url,
      }
    : null;
}

export async function ensureUserWorkspace(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
) {
  await ensureProfile(supabase, user);

  const { data: existingMembership } = await supabase
    .from("group_members")
    .select("id")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (existingMembership) {
    return;
  }

  const metadataGroupName = typeof user.user_metadata?.group_name === "string" ? user.user_metadata.group_name.trim() : "";
  const metadataMonthlyAmount =
    typeof user.user_metadata?.monthly_amount === "number"
      ? user.user_metadata.monthly_amount
      : Number(String(user.user_metadata?.monthly_amount ?? "24").replace(",", "."));
  const groupName = metadataGroupName || "AbteilungsJackpot";
  const baseSlug = groupName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "abteilungsjackpot";
  const monthlyAmount = Number.isFinite(metadataMonthlyAmount) && metadataMonthlyAmount >= 0 ? metadataMonthlyAmount : 24;
  const slug = `${baseSlug}-${user.id.slice(0, 8)}`;

  const { data: group } = await supabase
    .from("groups")
    .insert({
      name: groupName,
      slug,
      monthly_amount: monthlyAmount,
      created_by: user.id,
    })
    .select("id")
    .single()
    .throwOnError();

  await supabase
    .from("group_members")
    .insert({
      group_id: group.id,
      profile_id: user.id,
      role: "admin",
      status: "active",
      monthly_amount: monthlyAmount,
    })
    .throwOnError();
}

export async function getAppContext(): Promise<AppContext> {
  const empty: AppContext = {
    userId: null,
    profile: null,
    group: null,
    membership: null,
    isAdmin: false,
    members: [],
    draws: [],
    tickets: [],
    payments: [],
    winnings: [],
    monthlyStats: [],
    totals: {
      activeMembers: 0,
      totalStake: 0,
      openPayments: 0,
      lastWinnings: 0,
      totalWinnings: 0,
    },
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return empty;
  }

  await ensureUserWorkspace(supabase, user);
  const profile = await ensureProfile(supabase, user);

  const { data: membershipRow } = await supabase
    .from("group_members")
    .select("id,group_id,role,status,monthly_amount,groups(id,name,monthly_amount,currency)")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!membershipRow) {
    return {
      ...empty,
      userId: user.id,
      profile,
    };
  }

  const rawGroup = Array.isArray(membershipRow.groups) ? membershipRow.groups[0] : membershipRow.groups;
  const group: AppGroup = {
    id: membershipRow.group_id,
    name: rawGroup?.name ?? "LottoCrew",
    monthlyAmount: toNumber(rawGroup?.monthly_amount),
    currency: rawGroup?.currency ?? "EUR",
  };
  const membership: AppMembership = {
    id: membershipRow.id,
    role: toRole(membershipRow.role),
    status: membershipRow.status,
    groupId: membershipRow.group_id,
    monthlyAmount: membershipRow.monthly_amount ? toNumber(membershipRow.monthly_amount) : null,
  };

  const [membersResult, drawsResult, ticketsResult, paymentsResult, winningsResult] = await Promise.all([
    supabase
      .from("group_members")
      .select("id,profile_id,role,status,monthly_amount,joined_at,profiles(id,email,display_name)")
      .eq("group_id", group.id)
      .order("joined_at", { ascending: true }),
    supabase
      .from("draws")
      .select("id,draw_date,jackpot_amount,status,result_numbers,result_extra_numbers")
      .eq("group_id", group.id)
      .order("draw_date", { ascending: false }),
    supabase
      .from("tickets")
      .select("id,label,status,stake_amount,draw_id,created_by,main_matches,euro_matches,prize_rank,ticket_image_path,draws(draw_date)")
      .eq("group_id", group.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("id,member_id,due_month,amount,status,paid_at")
      .eq("group_id", group.id)
      .order("due_month", { ascending: false }),
    supabase
      .from("winnings")
      .select("id,amount,prize_rank,recorded_at,ticket_id")
      .eq("group_id", group.id)
      .order("recorded_at", { ascending: false }),
  ]);

  const memberRows = membersResult.data ?? [];
  const members: AppMember[] = memberRows.map((member) => {
    const memberProfile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
    return {
      id: member.id,
      profileId: member.profile_id,
      name: getProfileName(memberProfile),
      email: memberProfile?.email ?? "",
      role: toRole(member.role),
      status: member.status,
      monthlyAmount: member.monthly_amount ? toNumber(member.monthly_amount) : group.monthlyAmount,
      joinedAt: member.joined_at,
    };
  });

  const draws: AppDraw[] = (drawsResult.data ?? []).map((draw) => ({
    id: draw.id,
    date: draw.draw_date,
    jackpot: toNumber(draw.jackpot_amount),
    status: draw.status,
    resultNumbers: Array.isArray(draw.result_numbers) ? draw.result_numbers.map(Number) : [],
    resultEuroNumbers: Array.isArray(draw.result_extra_numbers) ? draw.result_extra_numbers.map(Number) : [],
  }));

  const ticketRows = ticketsResult.data ?? [];
  const ticketIds = ticketRows.map((ticket) => ticket.id);
  const { data: ticketNumberRows } = ticketIds.length
    ? await supabase
        .from("ticket_numbers")
        .select("ticket_id,position,kind,number")
        .in("ticket_id", ticketIds)
        .order("position", { ascending: true })
    : { data: [] };

  const { data: ticketWinningRows } = ticketIds.length
    ? await supabase.from("winnings").select("ticket_id,amount").in("ticket_id", ticketIds)
    : { data: [] };

  const numbersByTicket = new Map<string, { main: number[]; extra: number[] }>();
  (ticketNumberRows ?? []).forEach((numberRow) => {
    const current = numbersByTicket.get(numberRow.ticket_id) ?? { main: [], extra: [] };
    if (numberRow.kind === "main") {
      current.main.push(numberRow.number);
    } else {
      current.extra.push(numberRow.number);
    }
    numbersByTicket.set(numberRow.ticket_id, current);
  });

  const winningsByTicket = new Map<string, number>();
  (ticketWinningRows ?? []).forEach((winning) => {
    winningsByTicket.set(winning.ticket_id, (winningsByTicket.get(winning.ticket_id) ?? 0) + toNumber(winning.amount));
  });

  const ticketLabels = new Map<string, string>();
  const tickets: AppTicket[] = await Promise.all(ticketRows.map(async (ticket) => {
    const draw = Array.isArray(ticket.draws) ? ticket.draws[0] : ticket.draws;
    ticketLabels.set(ticket.id, ticket.label);
    const imagePath = ticket.ticket_image_path ?? null;
    let imageUrl: string | null = null;

    if (imagePath) {
      const { data: signed } = await supabase.storage.from("ticket-documents").createSignedUrl(imagePath, 60 * 30);
      imageUrl = signed?.signedUrl ?? null;
    }

    return {
      id: ticket.id,
      label: ticket.label,
      status: ticket.status,
      drawId: ticket.draw_id,
      date: draw?.draw_date ?? null,
      numbers: numbersByTicket.get(ticket.id)?.main ?? [],
      euroNumbers: numbersByTicket.get(ticket.id)?.extra ?? [],
      stake: toNumber(ticket.stake_amount),
      winnings: winningsByTicket.get(ticket.id) ?? 0,
      createdBy: ticket.created_by ?? null,
      mainMatches: toNumber(ticket.main_matches),
      euroMatches: toNumber(ticket.euro_matches),
      prizeRank: ticket.prize_rank ?? null,
      imagePath,
      imageUrl,
    };
  }));

  const memberNames = new Map(members.map((member) => [member.id, member.name]));
  const payments: AppPayment[] = (paymentsResult.data ?? []).map((payment) => ({
    id: payment.id,
    memberId: payment.member_id,
    member: memberNames.get(payment.member_id) ?? "Mitglied",
    month: payment.due_month,
    amount: toNumber(payment.amount),
    status: toPaymentStatus(payment.status),
    paidAt: payment.paid_at,
  }));

  const winnings: AppWinning[] = (winningsResult.data ?? []).map((winning) => {
    const amount = toNumber(winning.amount);
    return {
      id: winning.id,
      date: winning.recorded_at,
      ticket: ticketLabels.get(winning.ticket_id) ?? "Tipp",
      amount,
      perMember: members.length ? amount / members.length : 0,
      rank: winning.prize_rank ?? "Gewinn",
    };
  });

  const monthlyStats = buildMonthlyStats(payments, winnings);
  const totalWinnings = winnings.reduce((sum, winning) => sum + winning.amount, 0);

  return {
    userId: user.id,
    profile,
    group,
    membership,
    isAdmin: membership.role === "admin",
    members,
    draws,
    tickets,
    payments,
    winnings,
    monthlyStats,
    totals: {
      activeMembers: members.filter((member) => member.status === "active").length,
      totalStake: payments.reduce((sum, payment) => sum + payment.amount, 0),
      openPayments: payments.filter((payment) => payment.status === "open").reduce((sum, payment) => sum + payment.amount, 0),
      lastWinnings: winnings[0]?.amount ?? 0,
      totalWinnings,
    },
  };
}
