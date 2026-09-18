'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ServiceInquiry } from '../types';
import { useToast } from './ToastProvider';

type FieldType = 'text' | 'number' | 'textarea';

interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
}

interface CatalogConfig {
  table: 'coaching_plans' | 'consultations' | 'courses';
  title: string;
  subtitle: string;
  fields: FieldConfig[];
}

const CATALOGS: CatalogConfig[] = [
  {
    table: 'coaching_plans',
    title: 'Coaching Tiers',
    subtitle: '1 / 3 / 6 month plans',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'price', label: 'Price (₹)', type: 'number' },
      { key: 'duration_months', label: 'Duration (months)', type: 'number' },
      { key: 'badge', label: 'Badge (optional)', type: 'text' },
      { key: 'image', label: 'Image URL', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    table: 'consultations',
    title: 'Consultations',
    subtitle: 'Single sessions',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'price', label: 'Price (₹)', type: 'number' },
      { key: 'duration', label: 'Duration (e.g. 45 min)', type: 'text' },
      { key: 'image', label: 'Image URL', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    table: 'courses',
    title: 'Courses',
    subtitle: 'Video courses',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'price', label: 'Price (₹)', type: 'number' },
      { key: 'tag', label: 'Tag (optional)', type: 'text' },
      { key: 'image', label: 'Image URL', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
];

const inputClass =
  'w-full bg-[#0c0c0b] border border-[#2a2a2a] text-white rounded-lg px-4 py-2.5 font-sans text-sm focus:outline-none focus:border-[#D2B48C]';

function CatalogManager({ config }: { config: CatalogConfig }) {
  const { toast, confirm } = useToast();
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const refresh = async () => {
    const { data, error } = await supabase.from(config.table).select('*').order('price', { ascending: true });
    if (error) {
      console.error(`${config.table} fetch failed:`, error);
      return;
    }
    setRows((data ?? []) as Array<Record<string, unknown>>);
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.table]);

  const startAdd = () => {
    setEditingId('new');
    setForm({});
  };

  const startEdit = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    const next: Record<string, string> = {};
    for (const field of config.fields) {
      const value = row[field.key];
      next[field.key] = value === null || value === undefined ? '' : String(value);
    }
    setForm(next);
  };

  const handleSave = async () => {
    const title = form.title?.trim();
    const price = Number(form.price);
    if (!title || !Number.isFinite(price) || price < 0) {
      toast('Title and a valid price are required.', 'error');
      return;
    }

    const payload: Record<string, unknown> = { title, price };
    for (const field of config.fields) {
      if (field.key === 'title' || field.key === 'price') continue;
      const raw = form[field.key]?.trim();
      if (!raw) {
        payload[field.key] = null;
      } else if (field.type === 'number') {
        const num = Number(raw);
        if (!Number.isFinite(num)) {
          toast(`${field.label} must be a number.`, 'error');
          return;
        }
        payload[field.key] = num;
      } else {
        payload[field.key] = raw;
      }
    }

    const { error } = editingId === 'new'
      ? await supabase.from(config.table).insert({ id: `${config.table.slice(0, 4)}-${Date.now()}`, ...payload })
      : await supabase.from(config.table).update(payload).eq('id', editingId);

    if (error) {
      console.error(`${config.table} save failed:`, error);
      toast('Save failed. Please try again.', 'error');
      return;
    }
    setEditingId(null);
    setForm({});
    toast('Saved.', 'success');
    void refresh();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm('Delete this entry? This cannot be undone.');
    if (!ok) return;
    const { error } = await supabase.from(config.table).delete().eq('id', id);
    if (error) {
      toast('Delete failed. Please try again.', 'error');
      return;
    }
    toast('Deleted.', 'success');
    void refresh();
  };

  return (
    <div className="glass-panel overflow-hidden rounded-xl border-white/5">
      <div className="p-6 md:p-8 border-b border-white/5 bg-[#0e0e0e]/50 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-xl text-white font-semibold">{config.title}</h3>
          <p className="font-sans text-[10px] text-[#c4c7c7]/60 tracking-wider uppercase">{config.subtitle}</p>
        </div>
        {editingId === null && (
          <button onClick={startAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#D2B48C] text-[#402d10] font-sans text-[10px] font-bold tracking-widest uppercase rounded hover:bg-[#feddb3] transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        )}
      </div>

      {editingId !== null && (
        <div className="p-6 md:p-8 border-b border-white/5 space-y-4 bg-[#D2B48C]/5">
          {config.fields.map((field) => (
            <label key={field.key} className="block">
              <span className="font-sans text-[9px] font-bold text-[#a0a0a0] tracking-wider uppercase block mb-1.5">{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea value={form[field.key] ?? ''} rows={3}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className={`${inputClass} resize-none`} />
              ) : (
                <input type={field.type === 'number' ? 'number' : 'text'} value={form[field.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className={inputClass} />
              )}
            </label>
          ))}
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#D2B48C] text-[#402d10] font-sans text-[10px] font-bold tracking-widest uppercase rounded hover:bg-[#feddb3] transition-colors">
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={() => { setEditingId(null); setForm({}); }} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 text-white/60 font-sans text-[10px] font-bold tracking-widest uppercase rounded hover:bg-white/10 transition-colors">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-white/5">
        {rows.map((row) => (
          <div key={String(row.id)} className="p-4 md:px-8 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <span className="font-sans text-sm text-white font-medium truncate block">{String(row.title ?? '')}</span>
              <span className="font-mono text-[10px] text-white/40">
                ₹{Number(row.price ?? 0).toLocaleString('en-IN')}
                {typeof row.duration_months === 'number' ? ` · ${row.duration_months} mo` : ''}
                {typeof row.duration === 'string' && row.duration ? ` · ${row.duration}` : ''}
              </span>
            </div>
            <button onClick={() => startEdit(row)} aria-label="Edit entry"
              className="p-2.5 bg-white/5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDelete(String(row.id))} aria-label="Delete entry"
              className="p-2.5 bg-white/5 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="p-8 text-center font-sans text-xs text-white/40">No entries yet. Seed the catalog or add one.</p>
        )}
      </div>
    </div>
  );
}

export default function ServicesAdmin() {
  const { toast, confirm } = useToast();
  const [inquiries, setInquiries] = useState<ServiceInquiry[]>([]);

  const refreshInquiries = async () => {
    const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) {
      console.error('Inquiries fetch failed:', error);
      return;
    }
    setInquiries((data ?? []) as ServiceInquiry[]);
  };

  useEffect(() => {
    void refreshInquiries();
  }, []);

  const handleStatus = async (inquiry: ServiceInquiry) => {
    const next = inquiry.status === 'new' ? 'replied' : 'new';
    const { error } = await supabase.from('inquiries').update({ status: next }).eq('id', inquiry.id);
    if (error) {
      toast('Update failed. Please try again.', 'error');
      return;
    }
    void refreshInquiries();
  };

  const handleDeleteInquiry = async (id: string) => {
    const ok = await confirm('Delete this inquiry?');
    if (!ok) return;
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) {
      toast('Delete failed. Please try again.', 'error');
      return;
    }
    void refreshInquiries();
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel overflow-hidden rounded-xl border-white/5">
        <div className="p-6 md:p-8 border-b border-white/5 bg-[#0e0e0e]/50">
          <h3 className="font-serif text-xl text-white font-semibold">Service Inquiries</h3>
          <p className="font-sans text-[10px] text-[#c4c7c7]/60 tracking-wider uppercase">Restaurant · Recipe dev · Custom work</p>
        </div>
        <div className="divide-y divide-white/5">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="p-4 md:px-8 space-y-2">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <span className="font-sans text-sm text-white font-medium truncate block">{inquiry.name} · {inquiry.service}</span>
                  <span className="font-mono text-[10px] text-white/40 truncate block">{inquiry.email}{inquiry.budget ? ` · ${inquiry.budget}` : ''}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase border whitespace-nowrap ${
                  inquiry.status === 'new'
                    ? 'bg-[#D2B48C]/10 text-[#D2B48C] border-[#D2B48C]/30'
                    : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20'
                }`}>
                  {inquiry.status}
                </span>
              </div>
              {inquiry.message && (
                <p className="font-sans text-xs text-white/60 leading-relaxed">{inquiry.message}</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => handleStatus(inquiry)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white">
                  <CheckCircle className="w-3.5 h-3.5" /> {inquiry.status === 'new' ? 'Mark Replied' : 'Reopen'}
                </button>
                <button onClick={() => handleDeleteInquiry(inquiry.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors text-[10px] font-bold uppercase tracking-widest">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
          {inquiries.length === 0 && (
            <p className="p-8 text-center font-sans text-xs text-white/40">No inquiries yet.</p>
          )}
        </div>
      </div>

      {CATALOGS.map((config) => (
        <CatalogManager key={config.table} config={config} />
      ))}
    </div>
  );
}
