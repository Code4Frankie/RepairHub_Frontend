import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api.js';
import { useToast } from '../lib/ToastContext.jsx';
import Shell from '../components/Shell.jsx';
import { Field, Input, Textarea } from '../components/Field.jsx';
import { Chip, Ticket } from '../components/ui.jsx';

const MODES = [
  { val: 'onsite', label: 'At my location' },
  { val: 'dropoff', label: 'Drop off' },
  { val: 'pickup', label: 'Pickup' },
];

export default function Booking() {
  const { quotationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [scheduledAt, setScheduledAt] = useState('');
  const [mode, setMode] = useState('onsite');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Server requires strictly future — give a 1-hour buffer as the datetime-local min.
  const min = new Date(Date.now() + 60 * 60000).toISOString().slice(0, 16);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});
    setLoading(true);

    const payload = {
      quotationId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      serviceMode: mode,
    };
    if (address.trim()) payload.address = address.trim();
    if (notes.trim()) payload.notes = notes.trim();

    try {
      const { data } = await api.post('/appointments', payload);
      toast('Appointment booked!', 'success');
      navigate(`/payment/${data.repairJobId}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const map = {};
        err.errors.forEach((fe) => { map[fe.field] = fe.message; });
        setFieldErrors(map);
      }
      setFormError(err.message || 'Could not book appointment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell title="Book appointment" back activePath={location.pathname}>
      <Ticket noPerf className="bg-success-bg border-success">
        <div className="text-success font-semibold text-[13px]">✓ Quotation accepted</div>
        <div className="text-ink-mute text-[13px] mt-0.5">Now schedule your appointment to lock it in.</div>
      </Ticket>

      <form onSubmit={handleSubmit}>
        <Field label="Date & time" htmlFor="scheduledAt" error={fieldErrors.scheduledAt}>
          <Input id="scheduledAt" type="datetime-local" required min={min}
            value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </Field>

        <Field label="Service mode">
          <div className="flex gap-2 flex-wrap">
            {MODES.map((m) => <Chip key={m.val} selected={mode === m.val} onClick={() => setMode(m.val)}>{m.label}</Chip>)}
          </div>
        </Field>

        <Field label={<>Address <span className="text-ink-mute font-normal">(if applicable)</span></>}>
          <Input maxLength={300} placeholder="12 Admiralty Way, Lekki Phase 1" value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>

        <Field label={<>Notes for the technician <span className="text-ink-mute font-normal">(optional)</span></>}>
          <Textarea maxLength={500} placeholder="Gate code, best time to call, etc." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        {formError && <div className="field-error mb-2.5">{formError}</div>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Booking…' : 'Confirm booking'}
        </button>
      </form>
    </Shell>
  );
}
