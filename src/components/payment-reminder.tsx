"use client";

import { BellRing } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PaymentReminderButton({ openCount }: { openCount: number }) {
  const [message, setMessage] = useState("");

  async function enableReminder() {
    if (!("Notification" in window)) {
      setMessage("Browser unterstuetzt keine Hinweise.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setMessage("Hinweise nicht erlaubt.");
      return;
    }

    if (openCount > 0) {
      new Notification("LottoCrew: offene Zahlungen", {
        body: `${openCount} Beitrag${openCount === 1 ? "" : "e"} sind noch offen.`,
      });
    }

    setMessage("Hinweise aktiv.");
  }

  return (
    <div className="mt-4">
      <Button type="button" variant="secondary" className="w-full" onClick={enableReminder}>
        <BellRing className="size-4" />
        Hinweise aktivieren
      </Button>
      {message ? <p className="mt-2 text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
