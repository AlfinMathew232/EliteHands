'use client';

import { useEffect, useState } from 'react';

export default function AdminLeaveApprovalsPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const resp = await fetch(`${apiBase}/api/admin/leave-requests/`, {
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

  const decide = async (leaveId, decision) => {
    try {
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const resp = await fetch(`${apiBase}/api/admin/leave-requests/${leaveId}/decision/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ decision }),
      });
      if (!resp.ok) throw new Error('Failed to update');
      const updated = await resp.json();
      setLeaves(prev => prev.map(l => l.id === updated.id ? updated : l));
    } catch (e) {
      setError(e.message || 'Failed to update leave request');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Leave Requests</h1>
          <p className="mt-2 text-sm text-gray-700">Approve or reject staff leave requests.</p>
        </div>
      </div>

      {error && <div className="mt-4 rounded bg-red-50 border border-red-200 text-red-700 p-2 text-sm">{error}</div>}

      <div className="mt-6 bg-white shadow rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No leave requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{l.staff_name || l.staff}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{l.start_date} → {l.end_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">{l.reason || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${l.status === 'approved' ? 'bg-green-100 text-green-800' : l.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => decide(l.id, 'approve')} disabled={l.status !== 'pending'} className="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-50">Approve</button>
                        <button onClick={() => decide(l.id, 'reject')} disabled={l.status !== 'pending'} className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
