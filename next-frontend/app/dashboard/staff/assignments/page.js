'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StaffAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
        const resp = await fetch(`${apiBase}/api/staff/assignments/`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!resp.ok) throw new Error('Failed to load assignments');
        const data = await resp.json();
        setAssignments(Array.isArray(data) ? data : (data.results || []));
      } catch (e) {
        setError(e.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">My Assignments</h1>
          <p className="mt-2 text-sm text-gray-700">Bookings assigned to you.</p>
        </div>
      </div>

      <div className="mt-6 bg-white shadow rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded">{error}</div>
        ) : assignments.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No assignments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{a.booking}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(a.assigned_at).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/dashboard/staff/bookings/${a.booking}`} className="text-primary-600 hover:text-primary-900">
                        View Details
                      </Link>
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
