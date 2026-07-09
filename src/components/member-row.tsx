"use client";

import { Mail, Pencil, UserMinus, X } from "lucide-react";
import { useState } from "react";
import { deactivateMember, reactivateMember, updateMemberEmail, updateMemberRole } from "@/app/actions";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Surface } from "@/components/ui/panel";
import type { AppMember } from "@/lib/app-data";
import { formatCurrency } from "@/lib/utils";

export function MemberRow({
  member,
  groupId,
  isAdmin,
  isSelf,
}: {
  member: AppMember;
  groupId: string;
  isAdmin: boolean;
  isSelf: boolean;
}) {
  const [editingEmail, setEditingEmail] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const isInactive = member.status !== "active";

  return (
    <Surface className={isInactive ? "opacity-70" : undefined}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">
            {member.name}
            {isInactive ? <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500">inaktiv</span> : null}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {member.email || "ohne E-Mail"} - {formatCurrency(member.monthlyAmount)}
          </p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => setEditingEmail((v) => !v)}
            className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="E-Mail bearbeiten"
          >
            {editingEmail ? <X className="size-4" /> : <Pencil className="size-4" />}
          </button>
        ) : null}
      </div>

      {editingEmail && isAdmin ? (
        <ActionForm
          action={updateMemberEmail}
          successMessage="Neue E-Mail gespeichert."
          resetOnSuccess={false}
          className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-3"
        >
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="profile_id" value={member.profileId} />
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Mail className="size-3.5" /> E-Mail korrigieren
          </span>
          <input
            name="email"
            type="email"
            defaultValue={member.email ?? ""}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-400"
          />
          <SubmitButton variant="secondary" className="w-full" pendingLabel="Speichert...">Neue E-Mail speichern</SubmitButton>
        </ActionForm>
      ) : null}

      <div className="mt-3">
        {/* Rollenwechsel mit Rueckfrage: Admin-Rechte zu vergeben oder zu
            entziehen ist folgenreich – ein Versehen-Klick soll nicht reichen. */}
        <ActionForm
          action={updateMemberRole}
          successMessage={`Rolle von ${member.name} gespeichert.`}
          resetOnSuccess={false}
          confirm={{
            question: `Rolle von ${member.name} wirklich ändern? Admins können Mitglieder, Zahlungen und Gewinne verwalten.`,
            confirmLabel: "Ja, Rolle ändern",
          }}
        >
          <div className="flex flex-1 items-center gap-2">
            <input type="hidden" name="group_id" value={groupId} />
            <input type="hidden" name="member_id" value={member.id} />
            <input type="hidden" name="profile_id" value={member.profileId} />
            <select
              name="role"
              defaultValue={member.role}
              disabled={!isAdmin || isSelf}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-amber-400 disabled:opacity-60"
            >
              <option value="participant">Teilnehmer</option>
              <option value="admin">Admin</option>
            </select>
            <SubmitButton variant="secondary" disabled={!isAdmin || isSelf}>Speichern</SubmitButton>
          </div>
        </ActionForm>
      </div>

      {isAdmin && !isSelf && !isInactive ? (
        confirmingRemove ? (
          <div className="mt-2 rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-xs font-medium text-rose-700">
              {member.name} deaktivieren? Die bisherigen Tipps und Zahlungen bleiben erhalten.
            </p>
            <div className="mt-2 flex gap-2">
              <ActionForm action={deactivateMember} successMessage={`${member.name} wurde deaktiviert.`} className="flex-1">
                <input type="hidden" name="group_id" value={groupId} />
                <input type="hidden" name="member_id" value={member.id} />
                <input type="hidden" name="profile_id" value={member.profileId} />
                <SubmitButton variant="danger" className="w-full" pendingLabel="...">Ja, deaktivieren</SubmitButton>
              </ActionForm>
              <Button variant="secondary" onClick={() => setConfirmingRemove(false)} type="button">
                Abbrechen
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingRemove(true)}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-rose-600"
          >
            <UserMinus className="size-3.5" /> Mitglied deaktivieren
          </button>
        )
      ) : null}

      {isAdmin && isInactive ? (
        <ActionForm action={reactivateMember} successMessage={`${member.name} ist wieder aktiv.`} className="mt-2">
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="member_id" value={member.id} />
          <SubmitButton variant="secondary" className="w-full" pendingLabel="...">Wieder aktivieren</SubmitButton>
        </ActionForm>
      ) : null}
    </Surface>
  );
}
