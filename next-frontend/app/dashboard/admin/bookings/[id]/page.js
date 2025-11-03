'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'no_show', label: 'No Show', color: 'bg-gray-100 text-gray-800' },
];

export default function BookingDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [staffError, setStaffError] = useState('');

  const handleAssignStaff = async () => {
    if (!selectedStaff) return;
    
    try {
      setIsAssigning(true);
      setStaffError('');
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/api/bookings/${id}/assign/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staff_id: selectedStaff }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to assign staff. Please try again.');
      }

      const data = await response.json();
      
      if (data && data.id) {
        // Refresh the assigned staff list
        await fetchAssignedStaff();
        
        // Clear selection
        setSelectedStaff('');
        
        // Show success message
        setStaffError('');
        
        // Refresh the booking data
        fetchBooking();
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (err) {
      console.error('Error assigning staff:', err);
      setStaffError(err.message || 'Failed to assign staff. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignStaff = async (assignmentId) => {
    if (!assignmentId) return;
    
    try {
      setIsAssigning(true);
      setStaffError('');
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/api/bookings/${id}/unassign/${assignmentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to unassign staff. Please try again.');
      }

      // Refresh the assigned staff list
      await fetchAssignedStaff();
      
      // Refresh the booking data
      fetchBooking();
      
    } catch (err) {
      console.error('Error unassigning staff:', err);
      setStaffError(err.message || 'Failed to unassign staff. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const fetchAvailableStaff = async () => {
    try {
      setStaffError('');
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('Fetching staff from:', `${apiBase}/api/staff/`);
      
      const response = await fetch(`${apiBase}/api/staff/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch staff. Please try again.');
      }

      const data = await response.json();
      console.log('Staff data received:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid staff data received from server');
      }
      
      // Filter out any staff that are already assigned
      const assignedStaffIds = assignedStaff.map(s => s.staff_id);
      const available = data.filter(staff => !assignedStaffIds.includes(staff.id));
      
      setAvailableStaff(available);
      
    } catch (err) {
      console.error('Error fetching staff:', err);
      setStaffError(err.message || 'Failed to load staff. Please try again.');
    }
  };

  // Fetch staff when assign modal is opened
  useEffect(() => {
    if (showAssignModal) {
      fetchAvailableStaff();
    }
  }, [showAssignModal]);

  const fetchAssignedStaff = async () => {
    try {
      setStaffError('');
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('Fetching assigned staff from:', `${apiBase}/api/bookings/${id}/assignments/`);
      
      const response = await fetch(`${apiBase}/api/bookings/${id}/assignments/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch assigned staff. Please try again.');
      }

      const data = await response.json();
      console.log('Assigned staff data received:', data);
      
      if (Array.isArray(data)) {
        const staffAssignments = data.map(assignment => ({
          id: assignment.id,
          staff_id: assignment.staff?.id || assignment.staff_id,
          staff_name: assignment.staff?.name || assignment.staff_name || 'Unknown Staff'
        }));
        setAssignedStaff(staffAssignments);
      } else {
        console.warn('Expected array of staff assignments, got:', data);
        setAssignedStaff([]);
      }
    } catch (err) {
      console.error('Error fetching assigned staff:', err);
      setStaffError(err.message || 'Failed to load assigned staff. Please try again.');
      setAssignedStaff([]);
    }
  };

  // Set assigned staff when booking data changes or when modal is opened
  useEffect(() => {
    if (showAssignModal) {
      fetchAssignedStaff();
    }
  }, [showAssignModal]);

  // Also load assigned staff on initial load when id is available
  useEffect(() => {
    if (id) {
      fetchAssignedStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Authentication required. Please log in again.');
        }

        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBase}/api/bookings/${id}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.detail || 
                             errorData.message || 
                             `Failed to fetch booking: ${response.status} ${response.statusText}`;
          
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            throw new Error('Session expired. Please log in again.');
          } else if (response.status === 404) {
            throw new Error('Booking not found. It may have been deleted or you may not have permission to view it.');
          } else {
            throw new Error(errorMessage);
          }
        }
        
        const data = await response.json();
        console.log('Booking data:', data);
        
        if (!data) {
          throw new Error('No booking data received from server');
        }
        
        setBooking(data);
        setStatus(data.status || 'pending');
        setSpecialInstructions(data.special_instructions || '');
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err.message);
        
        if (err.message.includes('Session expired') || 
            err.message.includes('Authentication') ||
            err.message.includes('401')) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    } else {
      setError('No booking ID provided');
      setIsLoading(false);
    }
  }, [id]);

  const handleStatusUpdate = async () => {
  try {
    setIsUpdating(true);
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiBase}/api/bookings/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update status');
    }

    const updatedBooking = await response.json();
    setBooking(updatedBooking);
    setShowStatusModal(false);
  } catch (err) {
    console.error('Error updating status:', err);
    setError(err.message);
  } finally {
    setIsUpdating(false);
  }
};


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">No booking data available.</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking #{booking.id}</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Update Status
          </button>
          <button
            onClick={() => setShowNotesModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            {booking.special_instructions ? 'Edit Notes' : 'Add Notes'}
          </button>
          
        </div>
      </div>

      {/* Staff Assignment Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Assigned Staff</h2>
        </div>
        <div className="border-t border-gray-200">
          {assignedStaff.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {assignedStaff.map((assignment) => (
                <li key={assignment.id} className="px-4 py-4 sm:px-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{assignment.staff_name}</p>
                  </div>
                  <button
                    onClick={() => handleUnassignStaff(assignment.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                    disabled={isAssigning}
                  >
                    {isAssigning ? 'Removing...' : 'Remove'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-500">No staff assigned to this booking yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Booking Details</h2>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusOptions.find(s => s.value === booking.status)?.color || 'bg-gray-100 text-gray-800'
                }`}>
                  {statusOptions.find(s => s.value === booking.status)?.label || booking.status}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Customer</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {booking.customer_name || 'N/A'}
                {booking.customer?.email && (
                  <span className="text-gray-500 block">{booking.customer.email}</span>
                )}
                {booking.customer?.phone && (
                  <span className="text-gray-500 block">{booking.customer.phone}</span>
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Service</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {booking.service_name || 'N/A'}
                {booking.service?.description && (
                  <p className="text-gray-500 mt-1">{booking.service.description}</p>
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(booking.scheduled_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
                {booking.scheduled_time && (
                  <span className="ml-2">at {new Date(`1970-01-01T${booking.scheduled_time}`).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}</span>
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                ${booking.total_amount ? parseFloat(booking.total_amount).toFixed(2) : '0.00'}
              </dd>
            </div>
            {booking.special_instructions && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Special Instructions</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                  {booking.special_instructions}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Update Booking Status</h3>
                  <div className="mt-4">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowStatusModal(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Update Modal */}
      {showNotesModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {booking.special_instructions ? 'Edit Special Instructions' : 'Add Special Instructions'}
                  </h3>
                  <div className="mt-4">
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      rows={6}
                      placeholder="Add any special instructions for this booking..."
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  onClick={handleNotesUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Instructions'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowNotesModal(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Assignment Modal */}
      {showAssignModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowAssignModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0111.317-3.317M15 21v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4m6 0h6m-6 0h-6" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Assign Staff to Booking</h3>
                  <div className="mt-4">
                    {staffError && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{staffError}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <select
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                      disabled={isAssigning}
                    >
                      <option value="">Select staff member</option>
                      {availableStaff.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.email})
                        </option>
                      ))}
                    </select>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Currently Assigned:</h4>
                      {assignedStaff.length > 0 ? (
                        <ul className="bg-gray-50 rounded-md p-2">
                          {assignedStaff.map((assignment) => (
                            <li key={assignment.id} className="flex justify-between items-center py-1">
                              <span className="text-sm">{assignment.staff_name}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No staff currently assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
                  onClick={handleAssignStaff}
                  disabled={!selectedStaff || isAssigning}
                >
                  {isAssigning ? 'Assigning...' : 'Assign Staff'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowAssignModal(false)}
                  disabled={isAssigning}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
