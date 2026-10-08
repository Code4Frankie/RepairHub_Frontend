import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api.js';
import { useToast } from '../lib/ToastContext.jsx';
import Shell from '../components/Shell.jsx';
import { Field, Input, Select, Textarea } from '../components/Field.jsx';
import { Chip } from '../components/ui.jsx';

const URGENCY = [
  { val: 'low', label: 'Low' },
  { val: 'normal', label: 'Normal' },
  { val: 'urgent', label: 'Urgent' },
];

export default function RequestNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast, toastError } = useToast();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    serviceCategoryId: searchParams.get('categoryId') || '',
    itemType: '', brandModel: '', problemDescription: '', address: '',
  });
  const [urgency, setUrgency] = useState('normal');
  const [geo, setGeo] = useState(null);
  const [geoStatus, setGeoStatus] = useState('');
  const [files, setFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    api.get('/service-categories').then(({ data }) => setCategories(data)).catch(toastError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleFiles(e) {
    const picked = Array.from(e.target.files).slice(0, 6 - files.length);
    setFiles((f) => [...f, ...picked].slice(0, 6));
    e.target.value = ''; // allow picking the same file again after removal
  }
  function removeFile(i) {
    setFiles((f) => f.filter((_, idx) => idx !== i));
  }

  function useLocationNow() {
    if (!navigator.geolocation) { setGeoStatus('Geolocation not supported on this device.'); return; }
    setGeoStatus('Locating…');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGeo({ lng: pos.coords.longitude, lat: pos.coords.latitude }); setGeoStatus('📍 Location added'); },
      () => setGeoStatus('Could not get your location — you can still submit without it.')
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});
    setLoading(true);

    const fd = new FormData();
    fd.append('serviceCategoryId', form.serviceCategoryId);
    fd.append('itemType', form.itemType.trim());
    if (form.brandModel.trim()) fd.append('brandModel', form.brandModel.trim());
    fd.append('problemDescription', form.problemDescription.trim());
    fd.append('urgency', urgency);
    if (form.address.trim()) fd.append('address', form.address.trim());
    if (geo) fd.append('location', JSON.stringify(geo));
    files.forEach((f) => fd.append('media', f));

    try {
      const { data } = await api.post('/repair-requests', fd, { isFormData: true });
      toast('Repair request submitted', 'success');
      navigate(`/request/${data._id}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const map = {};
        err.errors.forEach((fe) => { map[fe.field] = fe.message; });
        setFieldErrors(map);
      }
      setFormError(err.message || 'Could not submit request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell title="New repair request" back activePath={location.pathname}>
      <form onSubmit={handleSubmit}>
        <Field label="What needs repair?" htmlFor="cat" error={fieldErrors.serviceCategoryId}>
          <Select id="cat" required value={form.serviceCategoryId} onChange={set('serviceCategoryId')}>
            <option value="">Select a category…</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </Select>
        </Field>

        <Field label="Item (e.g. Laptop, Washing machine)" htmlFor="itemType" error={fieldErrors.itemType}>
          <Input id="itemType" required maxLength={100} placeholder="MacBook Pro" value={form.itemType} onChange={set('itemType')} />
        </Field>

        <Field label={<>Brand / model <span className="text-ink-mute font-normal">(optional)</span></>}>
          <Input maxLength={100} placeholder="Apple MacBook Pro 2020" value={form.brandModel} onChange={set('brandModel')} />
        </Field>

        <Field
          label="Describe the problem" htmlFor="problem"
          hint="At least 10 characters — the more detail, the more accurate the quotes you'll get."
          error={fieldErrors.problemDescription}
        >
          <Textarea id="problem" required minLength={10} maxLength={2000}
            placeholder="Cracked screen, still powers on and boots normally…"
            value={form.problemDescription} onChange={set('problemDescription')} />
        </Field>

        <Field label="Urgency">
          <div className="flex gap-2 flex-wrap">
            {URGENCY.map((u) => (
              <Chip key={u.val} selected={urgency === u.val} onClick={() => setUrgency(u.val)}>{u.label}</Chip>
            ))}
          </div>
        </Field>

        <Field label={<>Address <span className="text-ink-mute font-normal">(optional)</span></>}>
          <Input maxLength={300} placeholder="12 Admiralty Way, Lekki Phase 1" value={form.address} onChange={set('address')} />
        </Field>

        <Field label={<>Location <span className="text-ink-mute font-normal">(optional — helps match nearby technicians)</span></>}>
          <button type="button" className="btn-outline btn-sm" onClick={useLocationNow}>📍 Use my current location</button>
          {geoStatus && <div className="field-hint">{geoStatus}</div>}
        </Field>

        <Field label={<>Photos <span className="text-ink-mute font-normal">(up to 6)</span></>}>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFiles} />
          <div className="grid grid-cols-3 gap-2">
            {files.map((f, i) => (
              <div key={i} className="upload-slot relative h-[72px] rounded-[7px] border-[1.5px] border-dashed border-line bg-steel-dim overflow-hidden cursor-pointer"
                   onClick={() => removeFile(i)}>
                <img src={URL.createObjectURL(f)} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
            {files.length < 6 && (
              <div
                className="h-[72px] rounded-[7px] border-[1.5px] border-dashed border-line bg-steel-dim flex items-center justify-center text-xs text-ink-mute cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >+ Add</div>
            )}
          </div>
        </Field>

        {formError && <div className="field-error mb-2.5">{formError}</div>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
    </Shell>
  );
}
