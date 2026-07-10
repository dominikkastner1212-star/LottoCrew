import {
  autoEvaluateDraw,
  createDraw,
  createInitialGroup,
  createLedgerTransaction,
  createMonthlyPayments,
  createPayment,
  createTicket,
  createWinning,
  evaluateDraw,
  updateGroupSettings,
  updateProfile,
  uploadTicketDocument,
} from "@/app/actions";
import { AddMemberForm } from "@/components/add-member-form";
import { MemberRow } from "@/components/member-row";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Surface } from "@/components/ui/panel";
import type { AppContext, AppDraw, AppMember, AppTicket } from "@/lib/app-data";

// Einheitlicher Stil fuer Eingabefelder und Labels.
// text-base statt text-sm und slate-600 statt slate-500: besser lesbar,
// gerade fuer aeltere Kollegen.
const inputStyle =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-amber-400";
const labelStyle = "text-sm font-semibold text-slate-600";

export function ProfileForm({ profile }: { profile: AppContext["profile"] }) {
  return (
    <ActionForm action={updateProfile} successMessage="Profil gespeichert." resetOnSuccess={false} className="space-y-4">
      <label className="block">
        <span className={labelStyle}>Anzeigename</span>
        <input name="display_name" className={inputStyle} defaultValue={profile?.displayName ?? ""} required />
      </label>
      <div>
        <p className="text-xs text-slate-500">E-Mail</p>
        <p className="mt-1 text-sm font-semibold text-slate-600">{profile?.email ?? "Nicht angemeldet"}</p>
      </div>
      <SubmitButton className="w-full" pendingLabel="Wird gespeichert...">Profil speichern</SubmitButton>
    </ActionForm>
  );
}

export function CreateGroupForm() {
  return (
    <ActionForm action={createInitialGroup} successMessage="Gruppe erstellt! Du bist jetzt Admin." resetOnSuccess={false} className="space-y-4">
      <label className="block">
        <span className={labelStyle}>Gruppenname</span>
        <input name="name" className={inputStyle} defaultValue="AbteilungsJackpot" required />
      </label>
      <label className="block">
        <span className={labelStyle}>Monatsbeitrag (€)</span>
        <input name="monthly_amount" inputMode="decimal" className={inputStyle} defaultValue="24" required />
      </label>
      <SubmitButton className="w-full" pendingLabel="Wird erstellt...">Gruppe erstellen und mich als Admin setzen</SubmitButton>
    </ActionForm>
  );
}

export function GroupSettingsForm({ app }: { app: AppContext }) {
  if (!app.group) {
    return <CreateGroupForm />;
  }

  return (
    <ActionForm action={updateGroupSettings} successMessage="Gruppe gespeichert." resetOnSuccess={false} className="space-y-4">
      <input type="hidden" name="group_id" value={app.group.id} />
      <label className="block">
        <span className={labelStyle}>Name</span>
        <input name="name" className={inputStyle} defaultValue={app.group.name} disabled={!app.isAdmin} required />
      </label>
      <label className="block">
        <span className={labelStyle}>Monatsbeitrag (€)</span>
        <input
          name="monthly_amount"
          inputMode="decimal"
          className={inputStyle}
          defaultValue={app.group.monthlyAmount}
          disabled={!app.isAdmin}
          required
        />
      </label>
      <SubmitButton className="w-full" disabled={!app.isAdmin} pendingLabel="Wird gespeichert...">Gruppe speichern</SubmitButton>
      {app.group.inviteCode ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Einladungscode</p>
          <p className="mt-2 select-all font-mono text-2xl font-bold tracking-[0.2em] text-slate-900">{app.group.inviteCode}</p>
          <p className="mt-2 text-xs leading-5 text-amber-800/80">
            Gib diesen Code an Kollegen weiter. Bei der Registrierung waehlen sie &quot;Gruppe beitreten&quot; und landen direkt in eurer Runde.
          </p>
        </div>
      ) : null}
    </ActionForm>
  );
}

export function MemberRoleList({ members, groupId, currentProfileId, isAdmin }: { members: AppMember[]; groupId: string; currentProfileId: string | null; isAdmin: boolean }) {
  if (members.length === 0) {
    return <Surface className="text-sm text-slate-500">Noch keine Mitglieder vorhanden.</Surface>;
  }

  return (
    <div className="space-y-3">
      {isAdmin ? <AddMemberForm groupId={groupId} /> : null}
      {members.map((member) => {
        const isSelf = member.profileId === currentProfileId;
        return (
          <MemberRow
            key={member.id}
            member={member}
            groupId={groupId}
            isAdmin={isAdmin}
            isSelf={isSelf}
          />
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
      <ActionForm action={createDraw} successMessage="Ziehung angelegt.">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <input type="hidden" name="group_id" value={groupId} />
          <label className="block">
            <span className={labelStyle}>Ziehungsdatum</span>
            <input name="draw_date" type="date" required className={inputStyle} />
          </label>
          <label className="block">
            <span className={labelStyle}>Jackpot (€)</span>
            <input name="jackpot_amount" inputMode="decimal" required placeholder="0" className={inputStyle} />
          </label>
          <SubmitButton pendingLabel="Wird angelegt...">Ziehung anlegen</SubmitButton>
        </div>
      </ActionForm>
    </Surface>
  );
}

export function CreateTicketForm({ groupId, draws, isAdmin }: { groupId: string; draws: AppDraw[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <ActionForm action={createTicket} successMessage="Tipp gespeichert." className="space-y-4">
        <input type="hidden" name="group_id" value={groupId} />
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_10rem]">
          <label className="block">
            <span className={labelStyle}>Tippname</span>
            <input name="label" required placeholder="Eurojackpot Runde" className={inputStyle} />
          </label>
          <label className="block">
            <span className={labelStyle}>Ziehung</span>
            <select name="draw_id" required className={inputStyle}>
              <option value="">Auswählen</option>
              {draws.map((draw) => (
                <option key={draw.id} value={draw.id}>
                  {draw.date}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelStyle}>Einsatz (€)</span>
            <input name="stake_amount" inputMode="decimal" required placeholder="0" className={inputStyle} />
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
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-amber-400"
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
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-amber-400"
            />
          ))}
          <SubmitButton disabled={draws.length === 0} pendingLabel="Wird gespeichert...">Tipp speichern</SubmitButton>
        </div>
      </ActionForm>
    </Surface>
  );
}

export function CreatePaymentForm({ groupId, members, isAdmin }: { groupId: string; members: AppMember[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <ActionForm action={createPayment} successMessage="Zahlung angelegt.">
        <div className="grid gap-3 md:grid-cols-[1fr_10rem_10rem_auto] md:items-end">
          <input type="hidden" name="group_id" value={groupId} />
          <label className="block">
            <span className={labelStyle}>Mitglied</span>
            <select name="member_id" required className={inputStyle}>
              <option value="">Auswählen</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelStyle}>Monat</span>
            <input name="due_month" type="month" required className={inputStyle} />
          </label>
          <label className="block">
            <span className={labelStyle}>Betrag (€)</span>
            <input name="amount" inputMode="decimal" required placeholder="24" className={inputStyle} />
          </label>
          <SubmitButton disabled={members.length === 0} pendingLabel="Wird angelegt...">Zahlung anlegen</SubmitButton>
        </div>
      </ActionForm>
    </Surface>
  );
}

export function CreateLedgerTransactionForm({ groupId, members, isAdmin }: { groupId: string; members: AppMember[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <ActionForm action={createLedgerTransaction} successMessage="Transaktion gebucht.">
        <div className="grid gap-3 xl:grid-cols-[1fr_11rem_10rem_1fr_auto] xl:items-end">
          <input type="hidden" name="group_id" value={groupId} />
          <label className="block">
            <span className={labelStyle}>Mitglied</span>
            <select name="member_id" required className={inputStyle}>
              <option value="">Auswählen</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelStyle}>Typ</span>
            <select name="type" required className={inputStyle}>
              <option value="deposit">Einzahlung</option>
              <option value="correction">Korrektur</option>
            </select>
          </label>
          <label className="block">
            <span className={labelStyle}>Betrag (€)</span>
            <input name="amount" inputMode="decimal" required placeholder="24,00 oder -5,00" className={inputStyle} />
          </label>
          <label className="block">
            <span className={labelStyle}>Beschreibung</span>
            <input name="description" placeholder="z. B. Nachzahlung" className={inputStyle} />
          </label>
          <SubmitButton disabled={members.length === 0} pendingLabel="Wird gebucht...">Buchen</SubmitButton>
        </div>
      </ActionForm>
    </Surface>
  );
}

export function CreateMonthlyPaymentsForm({ groupId, isAdmin }: { groupId: string; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <ActionForm
        action={createMonthlyPayments}
        successMessage="Monatsbeiträge für alle aktiven Mitglieder angelegt."
        confirm={{
          question: "Beiträge für ALLE aktiven Mitglieder in diesem Monat anlegen? Das lässt sich nicht mit einem Klick rückgängig machen.",
          confirmLabel: "Ja, Beiträge anlegen",
        }}
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <input type="hidden" name="group_id" value={groupId} />
          <label className="block">
            <span className={labelStyle}>Monat für alle aktiven Mitglieder</span>
            <input name="due_month" type="month" required className={inputStyle} />
          </label>
          <SubmitButton pendingLabel="Wird angelegt...">Monatsbeiträge erzeugen</SubmitButton>
        </div>
      </ActionForm>
    </Surface>
  );
}

export function CreateWinningForm({ groupId, draws, tickets, isAdmin }: { groupId: string; draws: AppDraw[]; tickets: AppTicket[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <ActionForm action={createWinning} successMessage="Gewinn gespeichert. Glückwunsch an die Runde! 🎉">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_9rem_1fr_auto] md:items-end">
          <input type="hidden" name="group_id" value={groupId} />
          <label className="block">
            <span className={labelStyle}>Ziehung</span>
            <select name="draw_id" required className={inputStyle}>
              <option value="">Auswählen</option>
              {draws.map((draw) => (
                <option key={draw.id} value={draw.id}>
                  {draw.date}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelStyle}>Tipp</span>
            <select name="ticket_id" required className={inputStyle}>
              <option value="">Auswählen</option>
              {tickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelStyle}>Betrag (€)</span>
            <input name="amount" inputMode="decimal" required placeholder="0" className={inputStyle} />
          </label>
          <label className="block">
            <span className={labelStyle}>Gewinnrang</span>
            <input name="prize_rank" placeholder="z. B. 3 + 1" className={inputStyle} />
          </label>
          <SubmitButton disabled={draws.length === 0 || tickets.length === 0} pendingLabel="Wird gespeichert...">Gewinn speichern</SubmitButton>
        </div>
      </ActionForm>
    </Surface>
  );
}

export function EvaluateDrawForm({ groupId, draws, isAdmin }: { groupId: string; draws: AppDraw[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <ActionForm action={evaluateDraw} successMessage="Ziehung ausgewertet. Treffer wurden automatisch als Gewinne erfasst.">
        <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_1fr_auto] xl:items-end">
          <input type="hidden" name="group_id" value={groupId} />
          <label className="block">
            <span className={labelStyle}>Ziehung auswerten</span>
            <select name="draw_id" required className={inputStyle}>
              <option value="">Auswählen</option>
              {draws.map((draw) => (
                <option key={draw.id} value={draw.id}>
                  {draw.date}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelStyle}>Hauptzahlen</span>
            <input name="result_numbers" required placeholder="5 12 23 34 49" className={inputStyle} />
          </label>
          <label className="block">
            <span className={labelStyle}>Eurozahlen</span>
            <input name="result_extra_numbers" required placeholder="5 10" className={inputStyle} />
          </label>
          <label className="block">
            <span className={labelStyle}>Gesamtgewinn € (optional)</span>
            <input name="total_amount" inputMode="decimal" placeholder="z. B. 42,50" className={inputStyle} />
          </label>
          <SubmitButton disabled={draws.length === 0} pendingLabel="Wertet aus...">Manuell auswerten</SubmitButton>
        </div>
      </ActionForm>
    </Surface>
  );
}

export function AutoEvaluateDrawForm({ groupId, draws, isAdmin }: { groupId: string; draws: AppDraw[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <ActionForm action={autoEvaluateDraw} successMessage="Ziehung automatisch geprueft.">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <input type="hidden" name="group_id" value={groupId} />
          <label className="block">
            <span className={labelStyle}>Ziehung automatisch pruefen</span>
            <select name="draw_id" required className={inputStyle}>
              <option value="">Auswählen</option>
              {draws.map((draw) => (
                <option key={draw.id} value={draw.id}>
                  {draw.date}
                </option>
              ))}
            </select>
          </label>
          <SubmitButton disabled={draws.length === 0} pendingLabel="Prueft...">Automatisch pruefen</SubmitButton>
        </div>
      </ActionForm>
    </Surface>
  );
}

export function TicketDocumentUploadForm({ groupId, tickets, isAdmin }: { groupId: string; tickets: AppTicket[]; isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Surface>
      <ActionForm action={uploadTicketDocument} successMessage="Spielschein hochgeladen.">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <input type="hidden" name="group_id" value={groupId} />
          <label className="block">
            <span className={labelStyle}>Tipp</span>
            <select name="ticket_id" required className={inputStyle}>
              <option value="">Auswählen</option>
              {tickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelStyle}>Spielschein-Datei</span>
            <input
              name="file"
              type="file"
              accept="image/*,application/pdf"
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-500 outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-amber-300 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-950 focus:border-amber-400"
            />
          </label>
          <SubmitButton disabled={tickets.length === 0} pendingLabel="Lädt hoch...">Spielschein hochladen</SubmitButton>
        </div>
      </ActionForm>
    </Surface>
  );
}
