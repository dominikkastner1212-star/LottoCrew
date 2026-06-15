import {
  addMemberByEmail,
  createDraw,
  createInitialGroup,
  createPayment,
  createTicket,
  createWinning,
  updateGroupSettings,
  updateMemberRole,
  updateProfile,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/panel";
import type { AppContext, AppDraw, AppMember, AppTicket } from "@/lib/app-data";
import { formatCurrency } from "@/lib/utils";

export function ProfileForm({ profile }: { profile: AppContext["profile"] }) {
  return (
    <form action={updateProfile} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-300">Anzeigename</span>
        <input
          name="display_name"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
          defaultValue={profile?.displayName ?? ""}
          required
        />
      </label>
      <div>
        <p className="text-xs text-slate-500">E-Mail</p>
        <p className="mt-1 text-sm font-semibold text-slate-200">{profile?.email ?? "Nicht angemeldet"}</p>
      </div>
      <Button className="w-full">Profil speichern</Button>
    </form>
  );
}

export function CreateGroupForm() {
  return (
    <form action={createInitialGroup} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-300">Gruppenname</span>
        <input
          name="name"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
          defaultValue="AbteilungsJackpot"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-300">Monatsbeitrag</span>
        <input
          name="monthly_amount"
          inputMode="decimal"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
          defaultValue="24"
          required
        />
      </label>
      <Button className="w-full">Gruppe erstellen und mich als Admin setzen</Button>
    </form>
  );
}

export function GroupSettingsForm({ app }: { app: AppContext }) {
  if (!app.group) {
    return <CreateGroupForm />;
  }

  return (
    <form action={updateGroupSettings} className="space-y-4">
      <input type="hidden" name="group_id" value={app.group.id} />
      <label className="block">
        <span className="text-sm font-semibold text-slate-300">Name</span>
        <input
          name="name"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
          defaultValue={app.group.name}
          disabled={!app.isAdmin}
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-300">Monatsbeitrag</span>
        <input
          name="monthly_amount"
          inputMode="decimal"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
          defaultValue={app.group.monthlyAmount}
          disabled={!app.isAdmin}
          required
        />
      </label>
      <Button className="w-full" disabled={!app.isAdmin}>Gruppe speichern</Button>
    </form>
  );
}

export function MemberRoleList({ members, groupId, currentProfileId, isAdmin }: { members: AppMember[]; groupId: string; currentProfileId: string | null; isAdmin: boolean }) {
  if (members.length === 0) {
    return <Surface className="text-sm text-slate-500">Noch keine Mitglieder vorhanden.</Surface>;
  }

  return (
    <div className="space-y-3">
      {isAdmin ? (
        <Surface>
          <form action={addMemberByEmail} className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
            <input type="hidden" name="group_id" value={groupId} />
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Mitglied per E-Mail hinzufuegen</span>
              <input
                name="email"
                type="email"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
                placeholder="kollege@firma.de"
                required
              />
            </label>
            <select
              name="role"
              defaultValue="participant"
              className="rounded-2xl border border-white/10 bg-slate-900 px-3 py-3 text-sm font-semibold text-white outline-none focus:border-amber-300/50"
            >
              <option value="participant">Teilnehmer</option>
              <option value="admin">Admin</option>
            </select>
            <Button>Hinzufuegen</Button>
          </form>
        </Surface>
      ) : null}
      {members.map((member) => {
        const isSelf = member.profileId === currentProfileId;
        return (
          <Surface key={member.id}>
            <form action={updateMemberRole} className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
              <input type="hidden" name="group_id" value={groupId} />
              <input type="hidden" name="member_id" value={member.id} />
              <input type="hidden" name="profile_id" value={member.profileId} />
              <div>
                <p className="font-semibold text-white">{member.name}</p>
                <p className="mt-1 text-xs text-slate-500">{member.email || "ohne E-Mail"} - {formatCurrency(member.monthlyAmount)}</p>
              </div>
              <select
                name="role"
                defaultValue={member.role}
                disabled={!isAdmin || isSelf}
                className="rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-amber-300/50"
              >
                <option value="participant">Teilnehmer</option>
                <option value="admin">Admin</option>
              </select>
              <Button variant="secondary" disabled={!isAdmin || isSelf}>Rechte speichern</Button>
            </form>
          </Surface>
        );
      })}
    </div>
  );
}

export function CreateDrawForm({ groupId, isAdmin }: { groupId: string; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <form action={createDraw} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <input type="hidden" name="group_id" value={groupId} />
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Ziehungsdatum</span>
          <input
            name="draw_date"
            type="date"
            required
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Jackpot</span>
          <input
            name="jackpot_amount"
            inputMode="decimal"
            required
            placeholder="0"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
          />
        </label>
        <Button>Ziehung anlegen</Button>
      </form>
    </Surface>
  );
}

export function CreateTicketForm({ groupId, draws, isAdmin }: { groupId: string; draws: AppDraw[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <form action={createTicket} className="space-y-4">
        <input type="hidden" name="group_id" value={groupId} />
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_10rem]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Tippname</span>
            <input
              name="label"
              required
              placeholder="Eurojackpot Runde"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Ziehung</span>
            <select
              name="draw_id"
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
            >
              <option value="">Auswaehlen</option>
              {draws.map((draw) => (
                <option key={draw.id} value={draw.id}>
                  {draw.date}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Einsatz</span>
            <input
              name="stake_amount"
              inputMode="decimal"
              required
              placeholder="0"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((position) => (
            <input
              key={position}
              name={`main_${position}`}
              inputMode="numeric"
              required
              placeholder={`Zahl ${position}`}
              className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
            />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          {[1, 2].map((position) => (
            <input
              key={position}
              name={`extra_${position}`}
              inputMode="numeric"
              required
              placeholder={`Eurozahl ${position}`}
              className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50"
            />
          ))}
          <Button disabled={draws.length === 0}>Tipp speichern</Button>
        </div>
      </form>
    </Surface>
  );
}

export function CreatePaymentForm({ groupId, members, isAdmin }: { groupId: string; members: AppMember[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <form action={createPayment} className="grid gap-3 md:grid-cols-[1fr_10rem_10rem_auto] md:items-end">
        <input type="hidden" name="group_id" value={groupId} />
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Mitglied</span>
          <select name="member_id" required className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50">
            <option value="">Auswaehlen</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Monat</span>
          <input name="due_month" type="month" required className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Betrag</span>
          <input name="amount" inputMode="decimal" required placeholder="24" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50" />
        </label>
        <Button disabled={members.length === 0}>Zahlung anlegen</Button>
      </form>
    </Surface>
  );
}

export function CreateWinningForm({ groupId, draws, tickets, isAdmin }: { groupId: string; draws: AppDraw[]; tickets: AppTicket[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <form action={createWinning} className="grid gap-3 md:grid-cols-[1fr_1fr_9rem_1fr_auto] md:items-end">
        <input type="hidden" name="group_id" value={groupId} />
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Ziehung</span>
          <select name="draw_id" required className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50">
            <option value="">Auswaehlen</option>
            {draws.map((draw) => (
              <option key={draw.id} value={draw.id}>
                {draw.date}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Tipp</span>
          <select name="ticket_id" required className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50">
            <option value="">Auswaehlen</option>
            {tickets.map((ticket) => (
              <option key={ticket.id} value={ticket.id}>
                {ticket.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Betrag</span>
          <input name="amount" inputMode="decimal" required placeholder="0" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Gewinnrang</span>
          <input name="prize_rank" placeholder="z. B. 3 + 1" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50" />
        </label>
        <Button disabled={draws.length === 0 || tickets.length === 0}>Gewinn speichern</Button>
      </form>
    </Surface>
  );
}
