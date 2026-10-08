import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';
import { Field, Input } from '../components/Field.jsx';

export default function Register() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) return <Navigate to="/home" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: 'customer',
    };
    if (form.phone.trim()) payload.phone = form.phone.trim();

    try {
      const { data } = await api.post('/users/register', payload);
      login(data.token, data.user);
      navigate('/home');
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const map = {};
        err.errors.forEach((fe) => { map[fe.field] = fe.message; });
        setFieldErrors(map);
      }
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen px-4 pt-2">
      <div className="text-center py-7 pb-2">
        <img src="/logo-320.png" alt="RepairHub logo" className="w-[84px] h-[84px] object-contain mx-auto mb-3.5" />
        <h1 className="font-display text-ink text-[22px] font-semibold mb-1">Create your account</h1>
        <p className="text-ink-mute text-[13px]">Find a verified technician in minutes</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Field label="Full name" htmlFor="fullName" error={fieldErrors.fullName}>
          <Input id="fullName" required minLength={2} maxLength={100} placeholder="Chidinma Okonkwo"
            value={form.fullName} onChange={set('fullName')} />
        </Field>
        <Field label="Email" htmlFor="email" error={fieldErrors.email}>
          <Input id="email" type="email" required autoComplete="email" placeholder="you@example.com"
            value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Phone number" htmlFor="phone" hint="Nigerian mobile number, e.g. 0803..., 0703..., or +234803..." error={fieldErrors.phone}>
          <Input id="phone" placeholder="0803 123 4567" value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="Password" htmlFor="password" error={fieldErrors.password}>
          <Input id="password" type="password" required minLength={8} autoComplete="new-password"
            placeholder="At least 8 characters" value={form.password} onChange={set('password')} />
        </Field>
        {error && <div className="field-error mb-2.5">{error}</div>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-[13px] text-ink-mute mt-4">
        Already have an account? <Link to="/login" className="text-brand font-semibold">Log in</Link>
      </p>
    </div>
  );
}
