export type TicketStatus = "geplant" | "abgegeben" | "ausgewertet";
export type PaymentStatus = "offen" | "bezahlt";

export const group = {
  name: "AbteilungsJackpot",
  lottery: "Eurojackpot",
  monthlyStake: 24,
  jackpot: 68000000,
  nextDraw: "2026-06-19T20:00:00+02:00",
};

export const members = [
  { id: "m1", name: "Anna Keller", email: "anna@firma.de", role: "Admin", stake: 24, paid: true, joined: "2025-10-01" },
  { id: "m2", name: "Jonas Weber", email: "jonas@firma.de", role: "Teilnehmer", stake: 24, paid: true, joined: "2025-10-01" },
  { id: "m3", name: "Mira Schulte", email: "mira@firma.de", role: "Teilnehmer", stake: 24, paid: false, joined: "2025-11-15" },
  { id: "m4", name: "Tobias Brandt", email: "tobias@firma.de", role: "Teilnehmer", stake: 24, paid: true, joined: "2026-01-07" },
  { id: "m5", name: "Lea Hoffmann", email: "lea@firma.de", role: "Teilnehmer", stake: 24, paid: false, joined: "2026-02-03" },
  { id: "m6", name: "Nico Berger", email: "nico@firma.de", role: "Teilnehmer", stake: 24, paid: true, joined: "2026-03-12" },
];

export const draws = [
  { id: "d1", date: "2026-06-19", lottery: "Eurojackpot", jackpot: 68000000, status: "offen" },
  { id: "d2", date: "2026-06-14", lottery: "Eurojackpot", jackpot: 61000000, status: "ausgewertet" },
  { id: "d3", date: "2026-06-07", lottery: "Eurojackpot", jackpot: 53000000, status: "ausgewertet" },
  { id: "d4", date: "2026-05-31", lottery: "Eurojackpot", jackpot: 41000000, status: "ausgewertet" },
];

export const tickets = [
  {
    id: "T-2619-A",
    drawId: "d1",
    label: "Eurojackpot System A",
    status: "abgegeben" as TicketStatus,
    date: "2026-06-19",
    numbers: [4, 11, 19, 34, 48],
    euroNumbers: [3, 8],
    stake: 18.4,
    winnings: 0,
  },
  {
    id: "T-2619-B",
    drawId: "d1",
    label: "Schnelltipps Teamrunde",
    status: "geplant" as TicketStatus,
    date: "2026-06-19",
    numbers: [6, 15, 27, 38, 49],
    euroNumbers: [5, 11],
    stake: 12,
    winnings: 0,
  },
  {
    id: "T-2614-A",
    drawId: "d2",
    label: "Eurojackpot Teamfeld C",
    status: "ausgewertet" as TicketStatus,
    date: "2026-06-14",
    numbers: [2, 12, 21, 37, 45],
    euroNumbers: [4, 9],
    stake: 16.8,
    winnings: 38.5,
  },
  {
    id: "T-2607-A",
    drawId: "d3",
    label: "Eurojackpot Fokus",
    status: "ausgewertet" as TicketStatus,
    date: "2026-06-07",
    numbers: [8, 18, 25, 41, 46],
    euroNumbers: [2, 10],
    stake: 24,
    winnings: 92.4,
  },
];

export const payments = [
  { id: "p1", member: "Anna Keller", month: "Juni 2026", amount: 24, status: "bezahlt" as PaymentStatus, paidAt: "2026-06-03" },
  { id: "p2", member: "Jonas Weber", month: "Juni 2026", amount: 24, status: "bezahlt" as PaymentStatus, paidAt: "2026-06-04" },
  { id: "p3", member: "Mira Schulte", month: "Juni 2026", amount: 24, status: "offen" as PaymentStatus, paidAt: null },
  { id: "p4", member: "Tobias Brandt", month: "Juni 2026", amount: 24, status: "bezahlt" as PaymentStatus, paidAt: "2026-06-02" },
  { id: "p5", member: "Lea Hoffmann", month: "Juni 2026", amount: 24, status: "offen" as PaymentStatus, paidAt: null },
  { id: "p6", member: "Nico Berger", month: "Juni 2026", amount: 24, status: "bezahlt" as PaymentStatus, paidAt: "2026-06-01" },
];

export const winnings = [
  { id: "w1", date: "2026-06-14", ticket: "T-2614-A", amount: 38.5, perMember: 6.42, rank: "4 Richtige" },
  { id: "w2", date: "2026-06-07", ticket: "T-2607-A", amount: 92.4, perMember: 15.4, rank: "3 + 2 Eurozahlen" },
  { id: "w3", date: "2026-05-31", ticket: "T-2531-B", amount: 16.2, perMember: 2.7, rank: "3 Richtige" },
  { id: "w4", date: "2026-05-24", ticket: "T-2524-A", amount: 44.8, perMember: 7.47, rank: "4 Richtige" },
];

export const monthlyStats = [
  { month: "Jan", stake: 108, winnings: 22 },
  { month: "Feb", stake: 120, winnings: 0 },
  { month: "Mrz", stake: 132, winnings: 71 },
  { month: "Apr", stake: 144, winnings: 18 },
  { month: "Mai", stake: 144, winnings: 61 },
  { month: "Jun", stake: 144, winnings: 131 },
];

export const totals = {
  activeMembers: members.length,
  totalStake: payments.reduce((sum, payment) => sum + payment.amount, 0),
  openPayments: payments.filter((payment) => payment.status === "offen").reduce((sum, payment) => sum + payment.amount, 0),
  lastWinnings: winnings[0].amount,
  totalWinnings: winnings.reduce((sum, winning) => sum + winning.amount, 0),
};
