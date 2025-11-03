'use client';

import { useEffect, useState } from 'react';

export default function StaffLeaveRequestPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const load = async () => {
    try {
      setLoading(true);
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const resp = await fetch(`${apiBase}/api/staff/leave-requests/`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error('Failed to load leave requests');
      const data = await resp.json();
      setLeaves(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      setError(e.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.start_date || !form.end_date) {
      setError('Start and End dates are required');
      return;
    }
    try {
      setSubmitting(true);
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const resp = await fetch(`${apiBase}/api/staff/leave-requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to submit leave request');
      }
      setForm({ start_date: '', end_date: '', reason: '' });
      await load();
    } catch (e) {
      setError(e.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Request for Leave</h1>
          <p className="mt-2 text-sm text-gray-700">Submit a leave request and view your history.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">New Request</h2>
          {error && <div className="mb-3 rounded bg-red-50 border border-red-200 text-red-700 p-2 text-sm">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start date</label>
              <input type="date" name="start_date" value={form.start_date} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End date</label>
              <input type="date" name="end_date" value={form.end_date} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason</label>
              <textarea name="reason" rows={3} value={form.reason} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={submitting} className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">My Requests</h2>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-sm text-gray-500">No leave requests yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaves.map(l => (
                    <tr key={l.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{l.start_date} → {l.end_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{l.reason || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${l.status === 'approved' ? 'bg-green-100 text-green-800' : l.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
