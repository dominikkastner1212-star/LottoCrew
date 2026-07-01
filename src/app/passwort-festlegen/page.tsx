import { redirect } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { SetPasswordForm } from "@/components/set-password-form";
import { Panel } from "@/components/ui/panel";
import { createClient } from "@/lib/supabase/server";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/";

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="soft-grid pointer-events-none absolute inset-x-0 top-0 h-96 opacity-70" />
      <Panel className="relative w-full max-w-md p-6 md:p-8">
        <AppLogo />
        <div className="mt-10">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-900">Passwort festlegen</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Du wurdest zu LottoCrew eingeladen. Lege einmalig ein Passwort fest, damit du dich kuenftig
            jederzeit mit E-Mail und Passwort einloggen kannst.
          </p>
        </div>
        <SetPasswordForm next={safeNext} />
      </Panel>
    </main>
  );
}
