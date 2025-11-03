'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: '',
    position: '',
    work_email: '',
    work_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username || !form.email || !form.password || !form.password2) {
      setError('Please fill in username, email, and both password fields.');
      return;
    }
    if (form.password !== form.password2) {
      setError("Passwords don't match.");
      return;
    }

    try {
      setSubmitting(true);
      const token = (typeof window !== 'undefined') && (localStorage.getItem('token') || localStorage.getItem('accessToken'));
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const resp = await fetch(`${apiBase}/api/staff/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        const message = data?.error || Object.values(data || {}).flat().join(' ') || 'Failed to create user';
        throw new Error(message);
      }

      setSuccess('User created successfully.');
      // Small delay for UX then redirect
      setTimeout(() => router.replace('/dashboard/admin/users'), 800);
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-900">Add User</h1>
        <p className="mt-2 text-sm text-gray-700">Create a new staff user.</p>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">{error}</div>
        )}
        {success && (
          <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200">{success}</div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input name="username" value={form.username} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={form.email} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">First name</label>
              <input name="first_name" value={form.first_name} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last name</label>
              <input name="last_name" value={form.last_name} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input name="phone" value={form.phone} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <select 
                name="position" 
                value={form.position} 
                onChange={onChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select a position</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <optgroup label="Staff">
                  <option value="Movers">Movers</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Specialized Cleaners">Specialized Cleaners</option>
                  <option value="Event Planners/Assistants">Event Planners/Assistants</option>
                  <option value="Event Setup Crew">Event Setup Crew</option>
                  <option value="Drivers">Drivers</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Managers">Managers</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Work email</label>
              <input type="email" name="work_email" value={form.work_email} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Work phone</label>
              <input name="work_phone" value={form.work_phone} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" name="password" value={form.password} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input type="password" name="password2" value={form.password2} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create user'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
