'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  const [assignModal, setAssignModal] = useState({
    open: false,
    booking: null,
    staff: [],
    assignments: [],
    selected: [],
    loading: false,
    error: '',
    success: '',
    conflicts: [],
  });
  const bookingsPerPage = 10;

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token =
        localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token)
        throw new Error('You need to be logged in to view bookings');

      const response = await fetch(`${apiBase}/api/bookings/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(
          `Failed to fetch bookings: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : data.results || [];

      // Enrich bookings with current assignments so they persist across navigation
      const withAssignments = await Promise.all(
        list.map(async (b) => {
          try {
            const assignmentsRes = await fetch(
              `${apiBase}/api/bookings/${b.id}/assignments/`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
              }
            ).catch(() => ({ ok: true, status: 404, json: async () => [] }));
            if (assignmentsRes.status === 404) {
              return { ...b, assignments: [] };
            }
            if (!assignmentsRes.ok) return { ...b };
            const assignments = await assignmentsRes.json();
            const normalized = Array.isArray(assignments)
              ? assignments
              : assignments.results || [];
            return { ...b, assignments: normalized };
          } catch {
            return { ...b };
          }
        })
      );

      setBookings(withAssignments);
      setTotalPages(1);
    } catch (error) {
      alert(error.message);
      if (
        error.message.includes('session has expired') ||
        error.message.includes('logged in')
      ) {
        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openAssignModal = async (booking) => {
    try {
      setAssignModal((prev) => ({
        ...prev,
        open: true,
        booking,
        loading: true,
        error: '',
      }));

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token =
        localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token)
        throw new Error('Authentication required. Please log in again.');

      const [staffRes, assignmentsRes] = await Promise.all([
        fetch(`${apiBase}/api/staff/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch(`${apiBase}/api/bookings/${booking.id}/assignments/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }).catch(() => ({
          ok: true,
          status: 404,
          json: async () => [],
        })),
      ]);

      if (!staffRes.ok)
        throw new Error(
          staffRes.status === 401
            ? 'Session expired. Please log in again.'
            : 'Failed to fetch staff'
        );

      const staffData = await staffRes.json();
      const assignmentsData =
        assignmentsRes.status === 404
          ? []
          : await assignmentsRes.json();

      const filteredStaff = Array.isArray(staffData)
        ? staffData.filter(
            (u) => u.user_type === 'staff' || u.user_type === 'admin'
          )
        : (staffData.results || []).filter(
            (u) => u.user_type === 'staff' || u.user_type === 'admin'
          );

      const assignedIds = Array.isArray(assignmentsData)
        ? assignmentsData.map((a) => a.staff?.id || a.staff)
        : [];

      // Determine busy staff (already assigned to another booking at same date/time)
      const bookingDate = booking.scheduled_date;
      const busyIdsFromLocal = (Array.isArray(bookings) ? bookings : [])
        .filter(
          (b) =>
            b &&
            b.id !== booking.id &&
            String(b.scheduled_date) === String(bookingDate)
        )
        .flatMap((b) => Array.isArray(b.assignments) ? b.assignments : [])
        .map((a) => a?.staff?.id || a?.staff)
        .filter((id) => id != null);

      // Optionally, try to fetch leaves for the day and exclude those staff
      let leaveStaffIds = [];
      try {
        const leavesRes = await fetch(
          `${apiBase}/api/admin/leaves/?date=${encodeURIComponent(
            String(bookingDate)
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );
        if (leavesRes.ok) {
          const leaves = await leavesRes.json();
          const leavesArr = Array.isArray(leaves)
            ? leaves
            : Array.isArray(leaves?.results)
            ? leaves.results
            : [];
          leaveStaffIds = leavesArr
            .filter((lv) =>
              String(lv.date || lv.start_date) === String(bookingDate)
            )
            .map((lv) => lv.staff?.id || lv.staff)
            .filter((id) => id != null);
        }
      } catch {
        // ignore leave fetch errors; default to no leaves
      }

      const nonLeaveStaff = filteredStaff.filter(
        (s) => !leaveStaffIds.includes(s.id)
      );

      setAssignModal((prev) => ({
        ...prev,
        staff: nonLeaveStaff,
        assignments: Array.isArray(assignmentsData)
          ? assignmentsData
          : assignmentsData.results || [],
        selected: assignedIds,
        conflicts: Array.from(new Set(busyIdsFromLocal)),
        loading: false,
        error: '',
      }));
    } catch (error) {
      setAssignModal((prev) => ({
        ...prev,
        loading: false,
        error:
          error.message ||
          'Failed to load staff and assignments. Please try again.',
      }));
      if (
        error.message.includes('Session expired') ||
        error.message.includes('Authentication')
      ) {
        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`;
      }
    }
  };

  const closeAssignModal = () =>
    setAssignModal({
      open: false,
      booking: null,
      staff: [],
      assignments: [],
      selected: [],
      loading: false,
      error: '',
      success: '',
      conflicts: [],
    });

  const toggleSelectStaff = (staffId) =>
    setAssignModal((prev) => {
      const alreadySelected = prev.selected.includes(staffId);
      if (!alreadySelected && Array.isArray(prev.conflicts) && prev.conflicts.includes(staffId)) {
        alert('This staff member is already assigned to another booking at this time.');
        return { ...prev };
      }
      return {
        ...prev,
        selected: alreadySelected
          ? prev.selected.filter((id) => id !== staffId)
          : [...prev.selected, staffId],
      };
    });

  const saveAssignments = async () => {
    // Prevent saving if any selected staff are in conflicts (same-day assignment)
    const anyConflict = assignModal.selected.some((id) => assignModal.conflicts.includes(id));
    if (anyConflict) {
      setAssignModal((prev) => ({
        ...prev,
        error: 'One or more selected staff are already assigned to another booking on the same day.',
      }));
      return;
    }
    setAssignModal((prev) => ({ ...prev, loading: true, error: '' }));
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token =
      localStorage.getItem('token') || localStorage.getItem('accessToken');
    try {
      const assignments = assignModal.selected.map((staffId) => ({
        staff: staffId,
        role: 'crew',
      }));
      const response = await fetch(
        `${apiBase}/api/admin/bookings/${assignModal.booking.id}/assign/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ assignments }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to save assignments');
      }
      const updatedAssignmentsRes = await fetch(
        `${apiBase}/api/bookings/${assignModal.booking.id}/assignments/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );
      const updatedAssignments = await updatedAssignmentsRes.json();
      setBookings((prev) =>
        prev.map((b) =>
          b.id === assignModal.booking.id
            ? {
                ...b,
                assignments: Array.isArray(updatedAssignments)
                  ? updatedAssignments
                  : updatedAssignments.results || [],
              }
            : b
        )
      );
      setAssignModal((prev) => ({
        ...prev,
        loading: false,
        success: 'Assignments saved successfully!',
        error: '',
      }));
      setTimeout(closeAssignModal, 1500);
    } catch (error) {
      setAssignModal((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to save assignments. Please try again.',
      }));
    }
  };

  const removeAssignment = async (staffId) => {
    try {
      setAssignModal((prev) => ({ ...prev, loading: true, error: '' }));
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token =
        localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(
        `${apiBase}/api/admin/bookings/${assignModal.booking.id}/assign/${staffId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to remove assignment');
      }
      const updatedAssignmentsRes = await fetch(
        `${apiBase}/api/bookings/${assignModal.booking.id}/assignments/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );
      if (!updatedAssignmentsRes.ok)
        throw new Error('Failed to fetch updated assignments');
      const updatedAssignments = await updatedAssignmentsRes.json();
      setAssignModal((prev) => ({
        ...prev,
        assignments: Array.isArray(updatedAssignments)
          ? updatedAssignments
          : updatedAssignments.results || [],
        selected: updatedAssignments.map((a) => a.staff?.id || a.staff),
        loading: false,
        success: 'Staff unassigned successfully!',
      }));
      setBookings((prev) =>
        prev.map((b) =>
          b.id === assignModal.booking.id
            ? {
                ...b,
                assignments: Array.isArray(updatedAssignments)
                  ? updatedAssignments
                  : updatedAssignments.results || [],
              }
            : b
        )
      );
    } catch (error) {
      setAssignModal((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to remove assignment',
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${apiBase}/api/bookings/${bookingId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update booking status');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusStyles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {String(status || '').replace('_', ' ')}
      </span>
    );
  };

  const filteredBookings = bookings.filter((b) => {
    try {
      if (filters.status && b.status !== filters.status) return false;
      if (filters.dateFrom && String(b.scheduled_date) < filters.dateFrom)
        return false;
      if (filters.dateTo && String(b.scheduled_date) > filters.dateTo)
        return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const hay = [
          String(b.booking_id || b.id || ''),
          String(b.customer_name || ''),
          String(b.service_name || ''),
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    } catch {
      return true;
    }
  });

  const deleteBooking = async (bookingId) => {
    try {
      if (!confirm('Delete this booking? This action cannot be undone.')) return;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token =
        localStorage.getItem('token') || localStorage.getItem('accessToken');
      const resp = await fetch(`${apiBase}/api/bookings/${bookingId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      if (!(resp.ok || resp.status === 204))
        throw new Error('Failed to delete booking');
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (e) {
      alert(e.message || 'Failed to delete booking');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center"><div className="sm:flex-auto"><h1 className="text-2xl font-semibold text-gray-900">Bookings</h1><p className="mt-2 text-sm text-gray-700">View and manage all customer bookings.</p></div></div>
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div><label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label><select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"><option value="">All Statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No Show</option></select></div>
              <div><label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">From Date</label><input type="date" id="dateFrom" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
              <div><label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">To Date</label><input type="date" id="dateTo" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
              <div><label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label><div className="mt-1 relative rounded-md shadow-sm"><input type="text" name="search" id="search" value={filters.search} onChange={handleFilterChange} placeholder="Customer, service, or ID" className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md" /></div></div>
            </div>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredBookings.length > 0 ? (filteredBookings.map((booking) => (<tr key={booking.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{booking.booking_id}</td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{booking.customer_name}</div></td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{booking.service_name}</div><div className="text-sm text-gray-500">${Number(booking.total_amount || 0).toFixed(2)}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${booking.scheduled_date} ${booking.scheduled_time}`}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div className="flex flex-wrap gap-1">{(booking.assignments || []).length === 0 ? (<span className="text-gray-400">Unassigned</span>) : (booking.assignments.map(a => (<span key={a.id || a.staff} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700">{a.staff_name || a.staff?.name || 'Staff'} ({a.role || 'crew'})</span>)))}</div></td><td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex justify-end space-x-2"><Link href={`/dashboard/admin/bookings/${booking.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link><button onClick={() => openAssignModal(booking)} className="text-indigo-600 hover:text-indigo-900">Assign Staff</button>{booking.status === 'pending' && (<><button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="text-green-600 hover:text-green-900">Confirm</button><button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="text-red-600 hover:text-red-900">Cancel</button></>)}{booking.status === 'confirmed' && (<><button onClick={() => updateBookingStatus(booking.id, 'completed')} className="text-green-600 hover:text-green-900">Complete</button><button onClick={() => updateBookingStatus(booking.id, 'no_show')} className="text-yellow-600 hover:text-yellow-900">No Show</button></>)}{['completed','cancelled'].includes(booking.status) && (<button onClick={() => deleteBooking(booking.id)} className="text-red-600 hover:text-red-900">Delete</button>)}</div></td></tr>))) : (<tr><td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">No bookings found matching your criteria.</td></tr>)}</tbody></table></div>{totalPages > 1 && (<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"><div className="flex-1 flex justify-between sm:hidden"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button></div><div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"><div><p className="text-sm text-gray-700">Showing <span className="font-medium">{(currentPage - 1) * bookingsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * bookingsPerPage, bookings.length + (currentPage - 1) * bookingsPerPage)}</span> of <span className="font-medium">{bookings.length + (currentPage - 1) * bookingsPerPage}</span> results</p></div><div><nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><span className="sr-only">Previous</span><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>{Array.from({ length: Math.min(5, totalPages) }, (_, i) => { let pageNum; if (totalPages <= 5) { pageNum = i + 1; } else if (currentPage <= 3) { pageNum = i + 1; } else if (currentPage >= totalPages - 2) { pageNum = totalPages - 4 + i; } else { pageNum = currentPage - 2 + i; } return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>{pageNum}</button>); })}<button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><span className="sr-only">Next</span><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></button></nav></div></div></div>)}
        </div>
        {assignModal.open && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="bg-white rounded-lg shadow-xl w-full max-w-2xl"><div className="px-6 py-4 border-b"><h3 className="text-lg font-medium text-gray-900">Assign Staff to Booking #{assignModal.booking?.booking_id}</h3></div><div className="p-6 space-y-4">{assignModal.error && <div className="rounded bg-red-50 border border-red-200 text-red-700 p-2 text-sm">{assignModal.error}</div>}<div><h4 className="text-sm font-medium text-gray-700 mb-2">Select staff</h4><div className="max-h-64 overflow-auto border rounded">{assignModal.loading ? (<div className="p-4 text-sm text-gray-500">Loading staff members...</div>) : assignModal.staff.length > 0 ? (assignModal.staff.map(staff => (<label key={staff.id} className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50"><input type="checkbox" checked={assignModal.selected.includes(staff.id)} onChange={() => toggleSelectStaff(staff.id)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /><div className="min-w-0 flex-1"><div className="text-sm font-medium text-gray-900 truncate">{staff.full_name || staff.username || staff.email.split('@')[0]}</div><div className="text-xs text-gray-500 truncate">{staff.email}{staff.position && (<span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-2xs">{staff.position}</span>)}</div></div></label>))) : (<div className="p-4 text-sm text-gray-500">No staff members available for assignment.</div>)}</div></div><div><h4 className="text-sm font-medium text-gray-700 mb-2">Currently assigned</h4><div className="flex flex-wrap gap-2">{assignModal.assignments.length === 0 ? (<span className="text-sm text-gray-400">No staff assigned</span>) : (assignModal.assignments.map(a => (<span key={a.id} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{a.staff_name} ({a.role})<button onClick={() => removeAssignment(a.staff)} className="text-red-600 hover:text-red-800">✕</button></span>)))}</div></div></div><div className="px-6 py-4 border-t flex justify-end gap-2"><button onClick={closeAssignModal} className="px-4 py-2 rounded border bg-white text-gray-700">Cancel</button><button onClick={saveAssignments} disabled={assignModal.loading || assignModal.selected.length === 0} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">Save Assignments</button></div></div></div>)}
      </div>
    </div>
  );
}
