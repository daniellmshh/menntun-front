"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { CalendarCheck2, CheckCircle2, Clock3, GraduationCap, QrCode, RefreshCw, ScanLine, Settings2, Users } from "lucide-react";
import Loader from "@/components/shared/Loader";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types";
import type { AttendanceEventType, ClassStatus, Credential, Group, PickupContact, ResolvedStudent, Student, Subject } from "../types";

type LiveState = { id: string; state: string; studentProfile: { user: { firstName: string; lastName: string }; }; group: { name: string; grade?: { name: string } } };
type Tab = "gate" | "class" | "credentials" | "settings";
const classStatuses: ClassStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"];

export default function AttendancePageContent() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN].includes(user?.role ?? UserRole.STUDENT);
  const canTeach = isAdmin || user?.role === UserRole.TEACHER;
  const [tab, setTab] = useState<Tab>("gate");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [qrPayload, setQrPayload] = useState("");
  const [eventType, setEventType] = useState<AttendanceEventType>("CHECK_IN");
  const [resolved, setResolved] = useState<{ student: ResolvedStudent; contacts: PickupContact[] } | null>(null);
  const [pickupContactId, setPickupContactId] = useState("");
  const [idVerified, setIdVerified] = useState(false);
  const [reason, setReason] = useState("");
  const [live, setLive] = useState<LiveState[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ClassStatus>>({});
  const [sessionId, setSessionId] = useState("");
  const [credential, setCredential] = useState<Credential | null>(null);
  const [qrImage, setQrImage] = useState("");
  const [pickupStudent, setPickupStudent] = useState<Student | null>(null);
  const [pickupContacts, setPickupContacts] = useState<PickupContact[]>([]);
  const [settings, setSettings] = useState({ timezone: "America/Monterrey", startTime: "08:00", lateToleranceMins: 10, dailyCloseTime: "18:00", activeWeekdays: [1, 2, 3, 4, 5] as number[] });

  const isDeparture = eventType === "CHECK_OUT" || eventType === "EARLY_RELEASE";
  const activeGroup = useMemo(() => groups.find((group) => group.id === groupId), [groupId, groups]);

  const showRequestError = (requestError: unknown, fallback: string) => {
    const candidate = requestError as { response?: { data?: { message?: string; error?: string } } };
    setError(candidate.response?.data?.message ?? candidate.response?.data?.error ?? fallback);
  };

  const loadGate = useCallback(async () => {
    const [liveResponse, settingsResponse] = await Promise.all([api.get("/attendance/live"), api.get("/attendance/settings")]);
    setLive(liveResponse.data.data ?? []);
    const current = settingsResponse.data.data;
    if (current) setSettings({ timezone: current.timezone, startTime: current.startTime, lateToleranceMins: current.lateToleranceMins, dailyCloseTime: current.dailyCloseTime, activeWeekdays: current.activeWeekdays ?? [1, 2, 3, 4, 5] });
  }, []);

  const loadAcademic = useCallback(async () => {
    if (!canTeach) return;
    try {
      const response = await api.get("/academic/groups");
      const nextGroups = response.data.data ?? [];
      setGroups(nextGroups);
      setGroupId((current) => current || nextGroups[0]?.id || "");
    } catch { /* Portería remains available when academic is disabled. */ }
  }, [canTeach]);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { await Promise.all([loadGate(), loadAcademic()]); }
    catch (requestError) { showRequestError(requestError, "No fue posible cargar asistencias."); }
    finally { setLoading(false); }
  }, [loadAcademic, loadGate]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const interval = window.setInterval(() => { loadGate().catch(() => undefined); }, 30000);
    return () => window.clearInterval(interval);
  }, [loadGate]);
  useEffect(() => {
    if (!groupId || !canTeach) return;
    api.get(`/academic/groups/${groupId}/subjects`).then((response) => {
      const next = (response.data.data ?? []).filter((subject: Subject) => subject.assigned || isAdmin);
      setSubjects(next); setSubjectId((current) => next.some((subject: Subject) => subject.id === current) ? current : next[0]?.id || "");
    }).catch(() => { setSubjects([]); setSubjectId(""); });
    api.get(`/academic/groups/${groupId}/students`).then((response) => {
      const next = response.data.data?.assigned ?? [];
      setStudents(next); setStatuses(Object.fromEntries(next.map((student: Student) => [student.studentProfileId, "PRESENT"])));
      setSessionId("");
    }).catch(() => { setStudents([]); });
  }, [canTeach, groupId, isAdmin]);

  async function resolveQr(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null); setNotice(null);
    try {
      const response = await api.post("/attendance/resolve-credential", { qrPayload });
      setResolved(response.data.data); setPickupContactId(""); setIdVerified(false); setReason("");
    } catch (requestError) { showRequestError(requestError, "No fue posible validar el QR."); }
    finally { setBusy(false); }
  }

  async function registerEvent() {
    if (!resolved) return;
    if (isDeparture && (!pickupContactId || !idVerified)) { setError("Selecciona a la persona autorizada y confirma que verificaste su identificación."); return; }
    if (eventType === "EARLY_RELEASE" && !reason.trim()) { setError("Indica el motivo de la salida anticipada."); return; }
    setBusy(true); setError(null); setNotice(null);
    try {
      const response = await api.post("/attendance/scan", { qrPayload, type: eventType, pickupContactId: isDeparture ? pickupContactId : undefined, idVerified: isDeparture ? idVerified : undefined, reason: eventType === "EARLY_RELEASE" ? reason : undefined, clientEventId: crypto.randomUUID(), deviceId: "web-gate" });
      const student = response.data.data?.student;
      setNotice(`${student?.firstName ?? resolved.student.firstName} ${student?.lastName ?? resolved.student.lastName}: registro guardado.`);
      setQrPayload(""); setResolved(null); await loadGate();
    } catch (requestError) { showRequestError(requestError, "No fue posible registrar el movimiento."); }
    finally { setBusy(false); }
  }

  async function createSession() {
    if (!groupId || !subjectId) return;
    setBusy(true); setError(null);
    try { const response = await api.post("/attendance/class-sessions", { groupId, subjectId, blockLabel: "general" }); setSessionId(response.data.data.id); setNotice("Sesión de clase lista para capturar asistencia."); }
    catch (requestError) { showRequestError(requestError, "No fue posible crear la sesión."); }
    finally { setBusy(false); }
  }

  async function saveClassAttendance() {
    if (!sessionId) return;
    setBusy(true); setError(null);
    try {
      await api.post(`/attendance/class-sessions/${sessionId}/records`, { records: students.map((student) => ({ studentProfileId: student.studentProfileId, status: statuses[student.studentProfileId] ?? "PRESENT" })) });
      setNotice("Asistencia de clase guardada. La evidencia de clase regulariza el resumen diario aunque falte el acceso por portería.");
    } catch (requestError) { showRequestError(requestError, "No fue posible guardar la asistencia de clase."); }
    finally { setBusy(false); }
  }

  async function issueCredential(studentProfileId: string) {
    setBusy(true); setError(null);
    try {
      const response = await api.post(`/attendance/students/${studentProfileId}/credential`); const next = response.data.data as Credential;
      setCredential(next); setQrImage(await QRCode.toDataURL(next.qrPayload, { width: 320, margin: 2 }));
    } catch (requestError) { showRequestError(requestError, "No fue posible emitir la credencial QR."); }
    finally { setBusy(false); }
  }

  async function openPickupContacts(student: Student) {
    setBusy(true); setError(null);
    try { const response = await api.get(`/attendance/students/${student.studentProfileId}/pickup-contacts`); setPickupStudent(student); setPickupContacts(response.data.data ?? []); }
    catch (requestError) { showRequestError(requestError, "No fue posible cargar las personas autorizadas."); }
    finally { setBusy(false); }
  }

  async function createPickupContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!pickupStudent) return; const form = new FormData(event.currentTarget); setBusy(true); setError(null);
    try {
      await api.post("/attendance/pickup-contacts", { studentProfileId: pickupStudent.studentProfileId, name: form.get("name"), relationship: form.get("relationship"), phone: form.get("phone") || undefined, validFrom: form.get("validFrom") || undefined, validUntil: form.get("validUntil") || undefined, requiresIdCheck: true });
      await openPickupContacts(pickupStudent); event.currentTarget.reset(); setNotice("Persona autorizada agregada.");
    } catch (requestError) { showRequestError(requestError, "No fue posible guardar a la persona autorizada."); }
    finally { setBusy(false); }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null);
    try { await api.patch("/attendance/settings", settings); setNotice("Configuración de asistencias actualizada."); }
    catch (requestError) { showRequestError(requestError, "No fue posible guardar la configuración."); }
    finally { setBusy(false); }
  }

  if (loading) return <Loader minHeight="380px" />;

  return <div className="p-6 lg:p-8 space-y-6">
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow"><CalendarCheck2 className="text-white" /></div><div><h1 className="gradient-text text-3xl font-extrabold">Asistencias</h1><p className="text-sm text-[var(--text-secondary)]">Portería, sesiones de clase y cierre diario con trazabilidad.</p></div></div><button onClick={refresh} disabled={busy} className="glass-button"><RefreshCw size={17} />Actualizar</button></header>
    {error && <div className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-3 text-sm">{error}</div>}
    {notice && <div className="rounded-xl border border-[var(--success)]/40 bg-[var(--success)]/10 p-3 text-sm">{notice}</div>}
    <nav className="flex flex-wrap gap-2">{([{ id: "gate", label: "Portería", icon: ScanLine }, ...(canTeach ? [{ id: "class", label: "Clase", icon: GraduationCap }] : []), ...(isAdmin ? [{ id: "credentials", label: "Credenciales QR", icon: QrCode }, { id: "settings", label: "Configuración", icon: Settings2 }] : [])] as { id: Tab; label: string; icon: typeof ScanLine }[]).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={tab === id ? "glass-button" : "glass-button-secondary"}><Icon size={17} />{label}</button>)}</nav>

    {tab === "gate" && <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]"><div className="glass-panel rounded-2xl p-6 space-y-5"><div><h2 className="font-bold text-xl">Escanear acceso</h2><p className="text-sm text-[var(--text-secondary)]">El lector físico puede escribir el contenido del QR directamente en este campo.</p></div><form onSubmit={resolveQr} className="flex flex-col gap-3 sm:flex-row"><input autoFocus required value={qrPayload} onChange={(event) => setQrPayload(event.target.value)} className="glass-input flex-1" placeholder="Escanea o pega el QR del alumno" /><button disabled={busy} className="glass-button justify-center"><ScanLine size={18} />Validar</button></form>{resolved && <div className="rounded-xl border border-[var(--border-glass)] p-4 space-y-4"><div className="flex items-center gap-3"><CheckCircle2 className="text-[var(--success)]" /><div><p className="font-bold">{resolved.student.firstName} {resolved.student.lastName}</p><p className="text-sm text-[var(--text-secondary)]">{resolved.student.group.grade?.name ? `${resolved.student.group.grade.name} · ` : ""}{resolved.student.group.name}</p></div></div><select value={eventType} onChange={(event) => setEventType(event.target.value as AttendanceEventType)} className="glass-input w-full"><option value="CHECK_IN">Entrada</option><option value="CHECK_OUT">Salida regular</option><option value="EARLY_RELEASE">Salida anticipada</option><option value="RE_ENTRY">Reingreso</option></select>{isDeparture && <><select required value={pickupContactId} onChange={(event) => setPickupContactId(event.target.value)} className="glass-input w-full"><option value="">Selecciona a la persona autorizada</option>{resolved.contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name} · {contact.relationship}</option>)}</select>{eventType === "EARLY_RELEASE" && <input required value={reason} onChange={(event) => setReason(event.target.value)} className="glass-input w-full" placeholder="Motivo de salida anticipada" />}<label className="flex items-center gap-3 rounded-lg border border-[var(--warning)]/30 p-3 text-sm"><input checked={idVerified} onChange={(event) => setIdVerified(event.target.checked)} type="checkbox" />Verifiqué visualmente la identificación de la persona.</label></>}<button type="button" disabled={busy} onClick={registerEvent} className="glass-button w-full justify-center">Registrar {eventType.replace(/_/g, " ")}</button></div>}</div><LivePanel live={live} /></section>}

    {tab === "class" && <section className="space-y-5"><div className="glass-panel rounded-2xl p-5 grid gap-3 md:grid-cols-3"><select value={groupId} onChange={(event) => setGroupId(event.target.value)} className="glass-input"><option value="">Selecciona grupo</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.grade?.name ? `${group.grade.name} · ` : ""}{group.name}</option>)}</select><select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="glass-input"><option value="">Selecciona materia</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select><button disabled={!groupId || !subjectId || busy} onClick={createSession} className="glass-button justify-center">{sessionId ? "Sesión activa" : "Iniciar sesión"}</button></div>{activeGroup && <div className="glass-panel rounded-2xl overflow-hidden"><div className="p-5 border-b border-[var(--border-glass)] flex items-center justify-between"><div><h2 className="font-bold">{activeGroup.name}</h2><p className="text-sm text-[var(--text-secondary)]">Cada docente registra su propia sesión y materia.</p></div><button disabled={!sessionId || busy} onClick={saveClassAttendance} className="glass-button">Guardar asistencia</button></div><div className="divide-y divide-[var(--border-glass)]">{students.map((student) => <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" key={student.studentProfileId}><div><p className="font-medium">{student.firstName} {student.lastName}</p><p className="text-xs text-[var(--text-secondary)]">{student.enrollmentNumber ?? "Sin matrícula"}</p></div><select disabled={!sessionId} value={statuses[student.studentProfileId] ?? "PRESENT"} onChange={(event) => setStatuses((current) => ({ ...current, [student.studentProfileId]: event.target.value as ClassStatus }))} className="glass-input sm:w-44">{classStatuses.map((status) => <option key={status} value={status}>{labelStatus(status)}</option>)}</select></div>)}{!students.length && <p className="p-10 text-center text-[var(--text-secondary)]">Selecciona un grupo con alumnos inscritos.</p>}</div></div>}</section>}

    {tab === "credentials" && <section className="glass-panel rounded-2xl overflow-hidden"><div className="p-5 border-b border-[var(--border-glass)]"><h2 className="font-bold">Credenciales QR de alumnos</h2><p className="text-sm text-[var(--text-secondary)]">Al emitir una nueva credencial se revoca la anterior automáticamente.</p></div><div className="p-4 grid gap-3 md:grid-cols-2"><select value={groupId} onChange={(event) => setGroupId(event.target.value)} className="glass-input"><option value="">Selecciona grupo</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select><p className="text-sm self-center text-[var(--text-secondary)]">Genera el QR y administra las personas autorizadas para entrega.</p></div><div className="divide-y divide-[var(--border-glass)]">{students.map((student) => <div key={student.studentProfileId} className="p-4 flex flex-wrap items-center justify-between gap-3"><span className="font-medium">{student.firstName} {student.lastName}</span><div className="flex gap-2"><button disabled={busy} onClick={() => openPickupContacts(student)} className="glass-button-secondary">Personas</button><button disabled={busy} onClick={() => issueCredential(student.studentProfileId)} className="glass-button"><QrCode size={17} />Emitir QR</button></div></div>)}</div></section>}

    {tab === "settings" && <section className="glass-panel max-w-2xl rounded-2xl p-6"><h2 className="font-bold text-xl mb-1">Reglas operativas</h2><p className="text-sm text-[var(--text-secondary)] mb-5">El cierre automático marca como ausentes sólo a quienes no tienen evidencia de portería ni de clase. Reabrir un día requiere motivo desde la API administrativa.</p><form onSubmit={saveSettings} className="grid gap-4 md:grid-cols-2"><label className="space-y-1"><span className="text-sm">Zona horaria</span><input value={settings.timezone} onChange={(event) => setSettings((current) => ({ ...current, timezone: event.target.value }))} className="glass-input w-full" /></label><label className="space-y-1"><span className="text-sm">Inicio de jornada</span><input type="time" value={settings.startTime} onChange={(event) => setSettings((current) => ({ ...current, startTime: event.target.value }))} className="glass-input w-full" /></label><label className="space-y-1"><span className="text-sm">Tolerancia de retardo (minutos)</span><input type="number" min="0" max="180" value={settings.lateToleranceMins} onChange={(event) => setSettings((current) => ({ ...current, lateToleranceMins: Number(event.target.value) }))} className="glass-input w-full" /></label><label className="space-y-1"><span className="text-sm">Cierre diario automático</span><input type="time" value={settings.dailyCloseTime} onChange={(event) => setSettings((current) => ({ ...current, dailyCloseTime: event.target.value }))} className="glass-input w-full" /></label><label className="space-y-2 md:col-span-2"><span className="text-sm">Días lectivos</span><span className="flex flex-wrap gap-2">{["D", "L", "M", "M", "J", "V", "S"].map((day, dayIndex) => <button type="button" onClick={() => setSettings((current) => ({ ...current, activeWeekdays: current.activeWeekdays.includes(dayIndex) ? current.activeWeekdays.filter((item) => item !== dayIndex) : [...current.activeWeekdays, dayIndex] }))} className={settings.activeWeekdays.includes(dayIndex) ? "glass-button !px-3 !py-2" : "glass-button-secondary !px-3 !py-2"} key={`${day}-${dayIndex}`}>{day}</button>)}</span></label><button disabled={busy} className="glass-button justify-center md:col-span-2">Guardar reglas</button></form></section>}
    {credential && <QrModal credential={credential} image={qrImage} onClose={() => setCredential(null)} />}
    {pickupStudent && <PickupContactsModal student={pickupStudent} contacts={pickupContacts} busy={busy} onClose={() => setPickupStudent(null)} onSubmit={createPickupContact} />}
  </div>;
}

function LivePanel({ live }: { live: LiveState[] }) { return <aside className="glass-panel rounded-2xl overflow-hidden"><div className="p-5 border-b border-[var(--border-glass)] flex items-center gap-2"><Users className="text-[var(--accent-secondary)]" size={19} /><div><h2 className="font-bold">Dentro del plantel</h2><p className="text-xs text-[var(--text-secondary)]">Actualización automática cada 30 segundos.</p></div></div><div className="max-h-[460px] overflow-y-auto divide-y divide-[var(--border-glass)]">{live.filter((item) => item.state === "INSIDE").map((item) => <div className="p-4" key={item.id}><p className="font-medium">{item.studentProfile.user.firstName} {item.studentProfile.user.lastName}</p><p className="text-xs text-[var(--text-secondary)]">{item.group.grade?.name ? `${item.group.grade.name} · ` : ""}{item.group.name}</p></div>)}{!live.some((item) => item.state === "INSIDE") && <p className="p-10 text-center text-sm text-[var(--text-secondary)]">Aún no hay alumnos dentro.</p>}</div></aside>; }
function labelStatus(status: ClassStatus) { return ({ PRESENT: "Presente", LATE: "Retardo", ABSENT: "Ausente", EXCUSED: "Justificado" })[status]; }
function QrModal({ credential, image, onClose }: { credential: Credential; image: string; onClose: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><div className="glass-panel w-full max-w-sm rounded-2xl p-6 text-center space-y-4"><h2 className="font-bold text-xl">Credencial QR</h2>{image && <img className="mx-auto rounded-xl bg-white p-3" src={image} alt="Código QR de asistencia" />}<p className="text-xs text-[var(--text-secondary)]">Entrega este código al responsable del alumno. La credencial anterior queda revocada.</p><button onClick={() => { navigator.clipboard.writeText(credential.qrPayload).catch(() => undefined); }} className="glass-button w-full justify-center">Copiar respaldo</button><button onClick={onClose} className="glass-button-secondary w-full justify-center">Cerrar</button></div></div>; }
function PickupContactsModal({ student, contacts, busy, onClose, onSubmit }: { student: Student; contacts: PickupContact[]; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><div className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold text-xl">Personas autorizadas</h2><p className="text-sm text-[var(--text-secondary)]">{student.firstName} {student.lastName}. Portería siempre confirma identificación visual.</p></div><button onClick={onClose} className="glass-button-secondary !px-3 !py-2">Cerrar</button></div><div className="max-h-40 overflow-y-auto divide-y divide-[var(--border-glass)] rounded-xl border border-[var(--border-glass)]">{contacts.map((contact) => <div className="p-3 text-sm" key={contact.id}><p className="font-medium">{contact.name}</p><p className="text-[var(--text-secondary)]">{contact.relationship}</p></div>)}{!contacts.length && <p className="p-4 text-sm text-[var(--text-secondary)]">Aún no hay personas autorizadas.</p>}</div><form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2"><input required name="name" className="glass-input" placeholder="Nombre completo" /><input required name="relationship" className="glass-input" placeholder="Parentesco" /><input name="phone" className="glass-input" placeholder="Teléfono (opcional)" /><input name="validFrom" type="date" className="glass-input" /><input name="validUntil" type="date" className="glass-input" /><button disabled={busy} className="glass-button justify-center md:col-span-2">Agregar persona autorizada</button></form></div></div>; }
