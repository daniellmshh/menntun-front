"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import api from "@/lib/api/axios";

type FamilyItem = { student: { id: string; user: { firstName: string; lastName: string } } | null; summaries: { localDate: string; status: string; arrivedAt?: string | null; departedAt?: string | null }[]; events: { id: string; type: string; occurredAt: string; reason?: string | null }[] };

export default function FamilyAttendancePage() {
  const [items, setItems] = useState<FamilyItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [pushMessage, setPushMessage] = useState<string | null>(null); const [pushBusy, setPushBusy] = useState(false);
  useEffect(() => { api.get("/attendance/family").then(response => setItems(response.data.data ?? [])).catch(() => setError("No fue posible cargar el historial de asistencias.")).finally(() => setLoading(false)); }, []);
  async function enablePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) { setPushMessage("Este navegador no admite notificaciones push."); return; }
    setPushBusy(true); setPushMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("No autorizaste las notificaciones.");
      const keyResponse = await api.get("/attendance/push/public-key");
      const publicKey = keyResponse.data.data?.publicKey;
      if (!publicKey) throw new Error("Las alertas push aún no están configuradas para esta instalación.");
      const registration = await navigator.serviceWorker.register("/attendance-push-sw.js");
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToUint8Array(publicKey) });
      const json = subscription.toJSON();
      await api.post("/attendance/push/subscriptions", { endpoint: subscription.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth });
      setPushMessage("Alertas push activadas en este dispositivo.");
    } catch (requestError) { setPushMessage(requestError instanceof Error ? requestError.message : "No fue posible activar las alertas push."); }
    finally { setPushBusy(false); }
  }
  return <ModuleGuard moduleKey="attendance"><div className="p-6 lg:p-8 space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="gradient-text text-3xl font-extrabold">Asistencia de mi familia</h1><p className="text-sm text-[var(--text-secondary)]">Consulta entradas, salidas y resumen diario.</p></div><div className="text-right"><button onClick={enablePush} disabled={pushBusy} className="glass-button">{pushBusy ? "Activando…" : "Activar alertas en este dispositivo"}</button>{pushMessage && <p className="mt-2 max-w-sm text-xs text-[var(--text-secondary)]">{pushMessage}</p>}</div></header>{loading ? <Loader minHeight="280px" /> : error ? <p className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4">{error}</p> : items.map(item => <section key={item.student?.id} className="glass-panel rounded-2xl overflow-hidden"><div className="p-5 border-b border-[var(--border-glass)]"><h2 className="font-bold">{item.student?.user.firstName} {item.student?.user.lastName}</h2></div><div className="grid gap-0 lg:grid-cols-2"><div className="p-5"><h3 className="font-semibold mb-3">Resumen reciente</h3><div className="space-y-2">{item.summaries.map(summary => <div key={summary.localDate} className="flex justify-between text-sm"><span>{new Date(summary.localDate).toLocaleDateString("es-MX")}</span><span>{summary.status}</span></div>)}</div></div><div className="p-5 border-t lg:border-l lg:border-t-0 border-[var(--border-glass)]"><h3 className="font-semibold mb-3">Movimientos</h3><div className="space-y-2">{item.events.map(event => <div key={event.id} className="text-sm"><span className="font-medium">{event.type.replace(/_/g, " ")}</span><span className="text-[var(--text-secondary)]"> · {new Date(event.occurredAt).toLocaleString("es-MX")}</span>{event.reason && <p className="text-xs text-[var(--text-secondary)]">{event.reason}</p>}</div>)}</div></div></div></section>)}</div></ModuleGuard>;
}

function base64ToUint8Array(value: string) {
  const base64 = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}
