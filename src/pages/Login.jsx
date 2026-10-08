import React, { useState } from 'react';
import { Link, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';
import { Field, Input } from '../components/Field.jsx';

export default function Login() {
  const { isLoggedIn, login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) return <Navigate to="/home" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/users/login', { email: email.trim(), password });
      login(data.token, data.user);
      navigate(searchParams.get('next') || '/home');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen px-4 pt-2">
      <div className="text-center py-7 pb-2">
        <img src="/logo-320.png" alt="RepairHub logo" className="w-[84px] h-[84px] object-contain mx-auto mb-3.5" />
        <h1 className="font-display text-ink text-[22px] font-semibold mb-1">Welcome back</h1>
        <p className="text-ink-mute text-[13px]">Log in to track your repairs</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" required autoComplete="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" type="password" required autoComplete="current-password" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <div className="field-error mb-2.5">{error}</div>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-center text-[13px] text-ink-mute mt-4.5 mt-4">
        New to RepairHub?{' '}
        <Link to="/register" className="text-brand font-semibold">Create an account</Link>
      </p>
    </div>
  );
}
