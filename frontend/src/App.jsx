import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, Check, CheckCircle2, ChevronDown, ClipboardList, Clock3, Cpu, LayoutDashboard, LoaderCircle, Plus, RefreshCw, Search, ShieldCheck, Trash2, Wrench, X, Pencil, Eye } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001').replace(/\/$/, '');
const API = `${API_BASE}/appliancerepair`;
const blankForm = { applianceName: '', issueDescription: '', repairCost: '', resolved: 'false' };

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  const bodyText = await response.text();
  let body = bodyText;
  try { body = bodyText ? JSON.parse(bodyText) : null; } catch {}
  if (!response.ok) {
    const detail = typeof body === 'string' ? body : body?.message || body?.error || body?.detail;
    throw new Error(detail || `Request failed (${response.status})`);
  }
  return body;
}

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }) : '—';
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);

  const loadTickets = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await request('/displayall');
      if (!Array.isArray(data)) throw new Error('Unexpected response from the backend. Expected a list of tickets.');
      setTickets(data);
    } catch (e) {
      setError(`${e.message}. Check that Spring Boot is running on ${API_BASE} and the database is available.`);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const filtered = useMemo(() => tickets.filter(t => {
    const matchesQuery = [t.applianceName, t.issueDescription, String(t.id)].some(v => String(v ?? '').toLowerCase().includes(query.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'resolved' ? t.resolved === true : t.resolved !== true);
    return matchesQuery && matchesStatus;
  }), [tickets, query, statusFilter]);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.resolved !== true).length,
    resolved: tickets.filter(t => t.resolved === true).length,
    spend: tickets.reduce((sum, t) => sum + (Number(t.repairCost) || 0), 0),
  }), [tickets]);

  function openAdd() { setSelectedId(null); setForm(blankForm); setModal('add'); setNotice(''); setError(''); }
  function openEdit(ticket) {
    setSelectedId(ticket.id);
    setForm({ applianceName: ticket.applianceName ?? '', issueDescription: ticket.issueDescription ?? '', repairCost: String(ticket.repairCost ?? ''), resolved: String(ticket.resolved) });
    setModal('edit'); setNotice(''); setError('');
  }
  function closeModal() { setModal(null); setDetail(null); }
  function updateField(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function submitForm(e) {
    e.preventDefault(); setError(''); setNotice('');
    const applianceName = form.applianceName.trim();
    const issueDescription = form.issueDescription.trim();
    const repairCost = Number(form.repairCost);
    if (!applianceName || !issueDescription) { setError('Please fill in the appliance name and issue description.'); return; }
    if (form.repairCost === '' || !Number.isFinite(repairCost) || repairCost < 0) { setError('Enter a valid repair cost of 0 or more.'); return; }
    const payload = { applianceName, issueDescription, repairCost, resolved: form.resolved === 'true' };
    setSaving(true);
    try {
      if (modal === 'edit') await request(`/updatebyid/${selectedId}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await request('/add', { method: 'POST', body: JSON.stringify(payload) });
      closeModal();
      setNotice(modal === 'edit' ? 'Ticket updated successfully.' : 'Repair ticket created successfully.');
      await loadTickets();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function deleteTicket(ticket) {
    if (!window.confirm(`Delete ticket #${ticket.id} for ${ticket.applianceName}? This action cannot be undone.`)) return;
    setError(''); setNotice('');
    try {
      await request(`/deletebyid/${ticket.id}`, { method: 'DELETE' });
      setNotice(`Ticket #${ticket.id} deleted successfully.`);
      await loadTickets();
    } catch (e) { setError(e.message); }
  }

  async function viewTicket(ticket) {
    setError('');
    try { setDetail(await request(`/displaybyid/${ticket.id}`)); setModal('view'); }
    catch (e) { setError(e.message); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Wrench size={22}/></div><div><strong>FixFlow</strong><span>REPAIR MANAGEMENT</span></div></div>
      <div className="nav-label">WORKSPACE</div>
      <button type="button" className={`nav-item nav-button ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveSection('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><LayoutDashboard size={18}/> Dashboard</button>
      <button type="button" className={`nav-item nav-button ${activeSection === 'tickets' ? 'active' : ''}`} onClick={() => { setActiveSection('tickets'); document.getElementById('repair-tickets')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><ClipboardList size={18}/> Repair tickets <span className="nav-count">{tickets.length}</span></button>
      <div className="sidebar-bottom"><div className="support-icon"><ShieldCheck size={19}/></div><div><strong>Keep things running</strong><p>Every repair, one place.</p></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="crumb">Workspace <span>/</span> <b>Dashboard</b></div><div className="topbar-right"><span className="live-dot"></span><span>API-connected workspace</span><div className="avatar">FF</div></div></header>
      <section className="page">
        <div className="page-heading"><div><div className="eyebrow"><Activity size={14}/> SERVICE OVERVIEW</div><h1>Appliance repair tickets</h1><p className="subtitle">Track service requests, manage repairs, and keep every appliance running.</p></div><button className="btn-primary-custom" onClick={openAdd}><Plus size={18}/> New ticket</button></div>

        {notice && <div className="alert-inline success"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><X size={16}/></button></div>}
        {error && !modal && <div className="alert-inline danger"><AlertCircle size={18}/><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss"><X size={16}/></button></div>}

        <div className="stats-grid">
          <Stat icon={<ClipboardList size={19}/>} label="Total tickets" value={stats.total} hint="All service requests" tone="blue"/>
          <Stat icon={<Clock3 size={19}/>} label="Awaiting repair" value={stats.open} hint="Still in progress" tone="amber"/>
          <Stat icon={<CheckCircle2 size={19}/>} label="Resolved" value={stats.resolved} hint="Successfully completed" tone="green"/>
          <Stat icon={<Cpu size={19}/>} label="Repair value" value={money(stats.spend)} hint="Combined estimated cost" tone="violet"/>
        </div>

        <section className="panel">
          <div className="panel-heading"><div><h2>All repair tickets</h2><p>View and manage your appliance service records.</p></div><button className="btn-refresh" onClick={loadTickets} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''}/> Refresh</button></div>
          <div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search appliance, issue, or ticket ID..." aria-label="Search tickets"/></div><div className="filter-wrap"><ChevronDown size={15}/><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="open">Awaiting repair</option><option value="resolved">Resolved</option></select></div></div>
          <div className="table-wrap"><table className="tickets-table"><thead><tr><th>TICKET</th><th>APPLIANCE / ISSUE</th><th>REPAIR COST</th><th>STATUS</th><th className="text-end">ACTIONS</th></tr></thead><tbody>
            {loading ? <tr><td colSpan="5"><div className="table-state"><LoaderCircle className="spin" size={24}/><span>Loading repair tickets…</span></div></td></tr>
            : filtered.length === 0 ? <tr><td colSpan="5"><div className="empty-state"><div className="empty-icon"><ClipboardList size={25}/></div><strong>{tickets.length ? 'No matching tickets' : 'No repair tickets yet'}</strong><p>{tickets.length ? 'Try changing your search or status filter.' : 'Create your first ticket to get started.'}</p>{!tickets.length && <button className="btn-primary-custom small" onClick={openAdd}><Plus size={16}/> Create first ticket</button>}</div></td></tr>
            : filtered.map(t => <tr key={t.id}><td><span className="ticket-id">#{t.id}</span><span className="ticket-sub">Repair request</span></td><td><div className="appliance-name">{t.applianceName || 'Unnamed appliance'}</div><div className="issue-text">{t.issueDescription || 'No description'}</div></td><td><span className="cost">{money(t.repairCost)}</span></td><td><span className={`status-pill ${t.resolved === true ? 'resolved' : 'open'}`}><span></span>{t.resolved === true ? 'Resolved' : 'Awaiting repair'}</span></td><td><div className="actions"><button className="icon-button" title="View details" onClick={() => viewTicket(t)}><Eye size={16}/></button><button className="icon-button" title="Edit ticket" onClick={() => openEdit(t)}><Pencil size={16}/></button><button className="icon-button delete" title="Delete ticket" onClick={() => deleteTicket(t)}><Trash2 size={16}/></button></div></td></tr>)}
          </tbody></table></div>
          <div className="table-footer"><span>Showing <b>{filtered.length}</b> of <b>{tickets.length}</b> tickets</span><span><span className="footer-dot"></span> Live data from Spring Boot</span></div>
        </section>
        <footer className="page-footer">FixFlow <span>·</span> Appliance Repair Ticket Management <span>·</span> Built for reliable service.</footer>
      </section>
    </main>

    {modal && <div className="modal-backdrop-custom" onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog-heading"><div className="dialog-icon">{modal === 'view' ? <Eye size={20}/> : modal === 'edit' ? <Pencil size={20}/> : <Plus size={21}/>}</div><div><h2 id="dialog-title">{modal === 'add' ? 'Create repair ticket' : modal === 'edit' ? `Edit ticket #${selectedId}` : `Ticket details${detail ? ` · #${detail.id}` : ''}`}</h2><p>{modal === 'view' ? 'Review the saved service request.' : 'Enter the appliance and repair information below.'}</p></div><button className="close-button" onClick={closeModal} aria-label="Close"><X size={20}/></button></div>
      {modal === 'view' ? detail ? <div className="detail-list"><Detail label="Ticket ID" value={`#${detail.id}`}/><Detail label="Appliance" value={detail.applianceName}/><Detail label="Issue description" value={detail.issueDescription}/><Detail label="Repair cost" value={money(detail.repairCost)}/><Detail label="Status" value={detail.resolved ? 'Resolved' : 'Awaiting repair'}/><div className="dialog-actions"><button className="btn-secondary-custom" onClick={closeModal}>Close</button><button className="btn-primary-custom" onClick={() => openEdit(detail)}><Pencil size={16}/> Edit ticket</button></div></div> : <div className="table-state"><LoaderCircle className="spin"/> Loading details…</div>
      : <form onSubmit={submitForm} noValidate><div className="form-body">
        <div className="field"><label htmlFor="applianceName">Appliance name <span>*</span></label><input id="applianceName" name="applianceName" value={form.applianceName} onChange={updateField} placeholder="e.g. Washing machine" maxLength="120" required autoFocus/><small>Enter the appliance that needs servicing.</small></div>
        <div className="field"><label htmlFor="issueDescription">Issue description <span>*</span></label><textarea id="issueDescription" name="issueDescription" value={form.issueDescription} onChange={updateField} placeholder="Describe the fault or repair needed…" rows="3" maxLength="1000" required/><small>Include any symptoms or details reported.</small></div>
        <div className="form-row"><div className="field"><label htmlFor="repairCost">Repair cost (₹) <span>*</span></label><input id="repairCost" name="repairCost" type="number" min="0" step="0.01" value={form.repairCost} onChange={updateField} placeholder="0.00" required/></div><div className="field"><label htmlFor="resolved">Repair status <span>*</span></label><select id="resolved" name="resolved" value={form.resolved} onChange={updateField}><option value="false">Awaiting repair</option><option value="true">Resolved</option></select></div></div>
        <div className="id-note"><ShieldCheck size={17}/><span><strong>Ticket ID is automatic.</strong> The backend generates the ID after saving. No ID entry is needed.</span></div>
        {error && <div className="form-error"><AlertCircle size={17}/>{error}</div>}
      </div><div className="dialog-actions"><button type="button" className="btn-secondary-custom" onClick={closeModal} disabled={saving}>Cancel</button><button type="submit" className="btn-primary-custom" disabled={saving}>{saving ? <LoaderCircle size={17} className="spin"/> : modal === 'edit' ? <Check size={17}/> : <Plus size={17}/>} {saving ? 'Saving…' : modal === 'edit' ? 'Save changes' : 'Create ticket'}</button></div></form>}
    </section></div>}
  </div>;
}

function Stat({ icon, label, value, hint, tone }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-hint">{hint}</div></div>; }
function Detail({ label, value }) { return <div className="detail-row"><span>{label}</span><strong>{value ?? '—'}</strong></div>; }
export default App;
