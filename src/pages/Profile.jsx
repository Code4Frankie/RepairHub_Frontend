import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';
import { useToast } from '../lib/ToastContext.jsx';
import { formatDate } from '../lib/format.js';
import Shell from '../components/Shell.jsx';
import { Ticket, Avatar, SkeletonCards } from '../components/ui.jsx';
import { Field, Input, Textarea } from '../components/Field.jsx';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast, toastError } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const [customerProfile, setCustomerProfile] = useState(null);
  const [address, setAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwError, setPwError] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    api.get('/customer-profiles/me').then(({ data }) => { setCustomerProfile(data); setAddress(data.address || ''); }).catch(() => {});
  }, []);

  async function saveDetails(e) {
    e.preventDefault();
    setDetailsError('');
    setSavingDetails(true);
    try {
      const { data } = await api.patch(`/users/${user._id}`, { fullName: fullName.trim(), phone: phone.trim() || undefined });
      updateUser(data);
      toast('Profile updated', 'success');
    } catch (err) {
      setDetailsError(err instanceof ApiError ? err.message : 'Could not update profile');
    } finally {
      setSavingDetails(false);
    }
  }

  async function saveAddress(e) {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const { data } = await api.patch(`/customer-profiles/${customerProfile._id}`, { address: address.trim() });
      setCustomerProfile(data);
      toast('Address updated', 'success');
    } catch (err) {
      toastError(err);
    } finally {
      setSavingAddress(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwError('');
    setSavingPw(true);
    try {
      await api.post('/users/change-password', pwForm);
      toast('Password changed', 'success');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : 'Could not change password');
    } finally {
      setSavingPw(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return <Shell title="Profile" activePath={location.pathname}><SkeletonCards n={2} /></Shell>;

  return (
    <Shell title="Profile" activePath={location.pathname}>
      <Ticket noPerf className="text-center mb-5">
        <Avatar name={user.fullName} size={56} />
        <div className="mx-auto" />
        <div className="font-display text-ink text-lg mt-2">{user.fullName}</div>
        <div className="text-ink-mute text-[13px]">{user.email}</div>
        <div className="text-ink-mute text-xs mt-1">Member since {formatDate(user.createdAt)}</div>
      </Ticket>

      <div className="text-sm font-semibold text-ink mb-2.5">Account details</div>
      <form onSubmit={saveDetails} className="mb-5">
        <Field label="Full name">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} maxLength={100} />
        </Field>
        <Field label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0803 123 4567" />
        </Field>
        {detailsError && <div className="field-error mb-2.5">{detailsError}</div>}
        <button type="submit" className="btn-outline" disabled={savingDetails}>{savingDetails ? 'Saving…' : 'Save details'}</button>
      </form>

      <div className="text-sm font-semibold text-ink mb-2.5">Default address</div>
      <form onSubmit={saveAddress} className="mb-5">
        <Field hint="Used to pre-fill repair requests.">
          <Textarea value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} placeholder="12 Admiralty Way, Lekki Phase 1" />
        </Field>
        <button type="submit" className="btn-outline" disabled={savingAddress || !customerProfile}>{savingAddress ? 'Saving…' : 'Save address'}</button>
      </form>

      <div className="text-sm font-semibold text-ink mb-2.5">Change password</div>
      <form onSubmit={changePassword} className="mb-5">
        <Field label="Current password">
          <Input type="password" required value={pwForm.currentPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} />
        </Field>
        <Field label="New password" hint="At least 8 characters">
          <Input type="password" required minLength={8} value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} />
        </Field>
        {pwError && <div className="field-error mb-2.5">{pwError}</div>}
        <button type="submit" className="btn-outline" disabled={savingPw}>{savingPw ? 'Updating…' : 'Change password'}</button>
      </form>

      <button className="btn-outline border-alert text-alert" onClick={handleLogout}>Log out</button>
    </Shell>
  );
}
