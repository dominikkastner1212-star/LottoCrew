import {
  addMemberByEmail,
  createDraw,
  createInitialGroup,
  createMonthlyPayments,
  createPayment,
  createTicket,
  createWinning,
  evaluateDraw,
  updateGroupSettings,
  updateMemberRole,
  updateProfile,
  uploadTicketDocument,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/panel";
import type { AppContext, AppDraw, AppMember, AppTicket } from "@/lib/app-data";
import { formatCurrency } from "@/lib/utils";

export function ProfileForm({ profile }: { profile: AppContext["profile"] }) {
  return (
    <form action={updateProfile} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-500">Anzeigename</span>
        <input
          name="display_name"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
          defaultValue={profile?.displayName ?? ""}
          required
        />
      </label>
      <div>
        <p className="text-xs text-slate-500">E-Mail</p>
        <p className="mt-1 text-sm font-semibold text-slate-600">{profile?.email ?? "Nicht angemeldet"}</p>
      </div>
      <Button className="w-full">Profil speichern</Button>
    </form>
  );
}

export function CreateGroupForm() {
  return (
    <form action={createInitialGroup} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-500">Gruppenname</span>
        <input
          name="name"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
          defaultValue="AbteilungsJackpot"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-500">Monatsbeitrag</span>
        <input
          name="monthly_amount"
          inputMode="decimal"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
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
        <span className="text-sm font-semibold text-slate-500">Name</span>
        <input
          name="name"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
          defaultValue={app.group.name}
          disabled={!app.isAdmin}
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-500">Monatsbeitrag</span>
        <input
          name="monthly_amount"
          inputMode="decimal"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
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
          <form action={addMemberByEmail} className="space-y-3">
            <input type="hidden" name="group_id" value={groupId} />
            <label className="block">
              <span className="text-sm font-semibold text-slate-500">Mitglied per E-Mail hinzufuegen</span>
              <input
                name="email"
                type="email"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
                placeholder="kollege@firma.de"
                required
              />
            </label>
            <select
              name="role"
              defaultValue="participant"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-amber-300/50"
            >
              <option value="participant">Teilnehmer</option>
              <option value="admin">Admin</option>
            </select>
            <Button className="w-full">Hinzufuegen</Button>
          </form>
        </Surface>
      ) : null}
      {members.map((member) => {
        const isSelf = member.profileId === currentProfileId;
        return (
          <Surface key={member.id}>
            <form action={updateMemberRole} className="space-y-3">
              <input type="hidden" name="group_id" value={groupId} />
              <input type="hidden" name="member_id" value={member.id} />
              <input type="hidden" name="profile_id" value={member.profileId} />
              <div>
                <p className="font-semibold text-slate-900">{member.name}</p>
                <p className="mt-1 text-xs text-slate-500">{member.email || "ohne E-Mail"} - {formatCurrency(member.monthlyAmount)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  name="role"
                  defaultValue={member.role}
                  disabled={!isAdmin || isSelf}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-amber-300/50 disabled:opacity-60"
                >
                  <option value="participant">Teilnehmer</option>
                  <option value="admin">Admin</option>
                </select>
                <Button variant="secondary" disabled={!isAdmin || isSelf}>Speichern</Button>
              </div>
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
          <span className="text-sm font-semibold text-slate-500">Ziehungsdatum</span>
          <input
            name="draw_date"
            type="date"
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Jackpot</span>
          <input
            name="jackpot_amount"
            inputMode="decimal"
            required
            placeholder="0"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
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
            <span className="text-sm font-semibold text-slate-500">Tippname</span>
            <input
              name="label"
              required
              placeholder="Eurojackpot Runde"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-500">Ziehung</span>
            <select
              name="draw_id"
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
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
            <span className="text-sm font-semibold text-slate-500">Einsatz</span>
            <input
              name="stake_amount"
              inputMode="decimal"
              required
              placeholder="0"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
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
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
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
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50"
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
          <span className="text-sm font-semibold text-slate-500">Mitglied</span>
          <select name="member_id" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50">
            <option value="">Auswaehlen</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Monat</span>
          <input name="due_month" type="month" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Betrag</span>
          <input name="amount" inputMode="decimal" required placeholder="24" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50" />
        </label>
        <Button disabled={members.length === 0}>Zahlung anlegen</Button>
      </form>
    </Surface>
  );
}

export function CreateMonthlyPaymentsForm({ groupId, isAdmin }: { groupId: string; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <form action={createMonthlyPayments} className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <input type="hidden" name="group_id" value={groupId} />
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Monat fuer alle aktiven Mitglieder</span>
          <input name="due_month" type="month" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50" />
        </label>
        <Button>Monatsbeitraege erzeugen</Button>
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
          <span className="text-sm font-semibold text-slate-500">Ziehung</span>
          <select name="draw_id" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50">
            <option value="">Auswaehlen</option>
            {draws.map((draw) => (
              <option key={draw.id} value={draw.id}>
                {draw.date}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Tipp</span>
          <select name="ticket_id" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50">
            <option value="">Auswaehlen</option>
            {tickets.map((ticket) => (
              <option key={ticket.id} value={ticket.id}>
                {ticket.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Betrag</span>
          <input name="amount" inputMode="decimal" required placeholder="0" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Gewinnrang</span>
          <input name="prize_rank" placeholder="z. B. 3 + 1" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50" />
        </label>
        <Button disabled={draws.length === 0 || tickets.length === 0}>Gewinn speichern</Button>
      </form>
    </Surface>
  );
}

export function EvaluateDrawForm({ groupId, draws, isAdmin }: { groupId: string; draws: AppDraw[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <form action={evaluateDraw} className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
        <input type="hidden" name="group_id" value={groupId} />
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Ziehung auswerten</span>
          <select name="draw_id" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50">
            <option value="">Auswaehlen</option>
            {draws.map((draw) => (
              <option key={draw.id} value={draw.id}>
                {draw.date}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Hauptzahlen</span>
          <input name="result_numbers" required placeholder="5 12 23 34 49" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Eurozahlen</span>
          <input name="result_extra_numbers" required placeholder="5 10" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50" />
        </label>
        <Button disabled={draws.length === 0}>Automatisch auswerten</Button>
      </form>
    </Surface>
  );
}

export function TicketDocumentUploadForm({ groupId, tickets, isAdmin }: { groupId: string; tickets: AppTicket[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <form action={uploadTicketDocument} className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <input type="hidden" name="group_id" value={groupId} />
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Tipp</span>
          <select name="ticket_id" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300/50">
            <option value="">Auswaehlen</option>
            {tickets.map((ticket) => (
              <option key={ticket.id} value={ticket.id}>
                {ticket.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-500">Spielschein-Datei</span>
          <input name="file" type="file" accept="image/*,application/pdf" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-amber-300 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-950 focus:border-amber-300/50" />
        </label>
        <Button disabled={tickets.length === 0}>Spielschein hochladen</Button>
      </form>
    </Surface>
  );
}
