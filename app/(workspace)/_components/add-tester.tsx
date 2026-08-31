"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LoaderCircle, RefreshCw, UserPlus } from "lucide-react";

type Candidate = { id: string; email: string; reason: string };

export function AddTester({ appId }: { appId: string }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("DEVELOPER");
  const [autoAssignBuild, setAutoAssignBuild] = useState(true);
  const [needsNames, setNeedsNames] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const router = useRouter();

  function reset() {
    setEmail(""); setFirstName(""); setLastName(""); setNeedsNames(false); setCandidate(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setCandidate(null);
    try {
      if (!needsNames) {
        const response = await fetch(`/api/apps/${appId}/testers/resolve?email=${encodeURIComponent(email)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Could not resolve tester.");
        if (result.needsNames) {
          setNeedsNames(true); setAdvanced(true); setFirstName(result.firstName ?? ""); setLastName(result.lastName ?? "");
          setMessage("This is a new team member. Apple requires their name before sending the invitation.");
          return;
        }
      }
      const response = await fetch(`/api/apps/${appId}/testers`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, firstName: firstName || undefined, lastName: lastName || undefined, role, autoAssignBuild }) });
      const body = await response.json();
      if (response.ok) { reset(); setMessage("Tester workflow started. Track each step in Operations."); router.refresh(); }
      else { setMessage(body.error ?? "Could not add tester."); setCandidate(body.candidate ?? null); if (body.needsNames) { setNeedsNames(true); setAdvanced(true); } }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not add tester."); }
    finally { setBusy(false); }
  }

  async function replace() {
    if (!candidate) return;
    setBusy(true);
    const response = await fetch(`/api/apps/${appId}/testers/replace`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, candidateId: candidate.id }) });
    const body = await response.json();
    if (response.ok) { setMessage("Safe replacement workflow started. Track it in Operations."); reset(); router.refresh(); }
    else setMessage(body.error ?? "Replacement failed.");
    setBusy(false);
  }

  return <form onSubmit={submit} className="card p-5">
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><UserPlus className="size-5" aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold">Add an internal tester</h2>
        <p className="muted mt-1 text-sm">Start with an email. Existing users and pending invitations are reused automatically.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor={`tester-email-${appId}`}>Tester email</label>
          <input className="input" id={`tester-email-${appId}`} type="email" value={email} onChange={event => { setEmail(event.target.value); setNeedsNames(false); }} placeholder="tester@example.com" required />
          <button className="btn btn-primary shrink-0" disabled={busy}>{busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <UserPlus className="size-4" aria-hidden />}{busy ? "Checking…" : needsNames ? "Send invitation" : "Add tester"}</button>
        </div>
        <button type="button" className="mt-3 flex items-center gap-1 text-sm font-semibold text-slate-700" onClick={() => setAdvanced(value => !value)} aria-expanded={advanced}>Advanced options <ChevronDown className={`size-4 transition ${advanced ? "rotate-180" : ""}`} aria-hidden /></button>
        {advanced && <div className="mt-3 grid gap-3 rounded-lg border bg-slate-50 p-4 sm:grid-cols-2">
          {(needsNames || firstName || lastName) && <><div><label className="label" htmlFor={`tester-first-${appId}`}>First name</label><input className="input" id={`tester-first-${appId}`} value={firstName} onChange={event => setFirstName(event.target.value)} required={needsNames} /></div><div><label className="label" htmlFor={`tester-last-${appId}`}>Last name</label><input className="input" id={`tester-last-${appId}`} value={lastName} onChange={event => setLastName(event.target.value)} required={needsNames} /></div></>}
          <div><label className="label" htmlFor={`tester-role-${appId}`}>Role</label><select className="input" id={`tester-role-${appId}`} value={role} onChange={event => setRole(event.target.value)}><option value="DEVELOPER">Developer</option><option value="APP_MANAGER">App Manager</option><option value="MARKETING">Marketing</option></select></div>
          <label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold"><input type="checkbox" className="size-4" checked={autoAssignBuild} onChange={event => setAutoAssignBuild(event.target.checked)} />Assign latest eligible build</label>
        </div>}
        {message && <p role="status" className="mt-3 text-sm text-slate-700">{message}</p>}
        {candidate && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-950">Suggested replacement</p><p className="mt-2 break-all font-mono text-sm">{candidate.email}</p><p className="mt-1 text-sm text-amber-900">{candidate.reason}</p><button type="button" className="btn mt-4 border border-amber-700 bg-amber-700 text-white" onClick={replace} disabled={busy}><RefreshCw className="size-4" aria-hidden />Replace safely</button></div>}
      </div>
    </div>
  </form>;
}
