import { Database, Shield, UserCircle, UsersRound } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { GroupSettingsForm, MemberRoleList, ProfileForm } from "@/components/admin-forms";
import { Panel, Surface } from "@/components/ui/panel";
import { requireAppContext } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const app = await requireAppContext();

  return (
    <AppShell>
      <PageHeader
        title="Admin"
        description="Profil, Gruppe, Rollen und Supabase-Status."
      />
      <section className="grid gap-5 xl:grid-cols-3">
        <Panel>
          <UserCircle className="size-5 text-amber-600" />
          <h2 className="mt-5 text-xl font-semibold text-slate-900">Mein Profil</h2>
          <div className="mt-5">
            <ProfileForm profile={app.profile} />
          </div>
        </Panel>

        <Panel>
          <UsersRound className="size-5 text-violet-500" />
          <h2 className="mt-5 text-xl font-semibold text-slate-900">Gruppe</h2>
          <div className="mt-5">
            <GroupSettingsForm app={app} />
          </div>
        </Panel>

        <Panel>
          <Shield className="size-5 text-emerald-200" />
          <h2 className="mt-5 text-xl font-semibold text-slate-900">Rechte</h2>
          <div className="mt-5">
            {app.group ? (
              <MemberRoleList members={app.members} groupId={app.group.id} currentProfileId={app.profile?.id ?? null} isAdmin={app.isAdmin} />
            ) : (
              <Surface className="text-sm text-slate-500">Erstelle zuerst eine Gruppe.</Surface>
            )}
          </div>
        </Panel>
      </section>

      <Panel className="mt-5">
        <Database className="size-5 text-violet-500" />
        <h2 className="mt-5 text-xl font-semibold text-slate-900">Supabase</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Die App nutzt echte Supabase-Daten aus eurer Gruppe.
        </p>
      </Panel>
    </AppShell>
  );
}
