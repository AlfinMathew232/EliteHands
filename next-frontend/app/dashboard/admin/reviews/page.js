'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const router = useRouter();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, [currentPage, searchTerm, filter]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const resp = await fetch(`${apiBase}/api/admin/reviews/`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (!resp.ok) throw new Error('Failed to load reviews');
      let data = await resp.json();
      const arr = Array.isArray(data) ? data : (data.results || []);
      // Map backend fields to UI fields used below
      const mapped = arr.map(r => ({
        id: r.id,
        user: { first_name: r.customer_name?.split(' ')[0] || '', last_name: r.customer_name?.split(' ').slice(1).join(' ') || '' },
        service_type: r.booking ? r.service_name || 'Service' : 'Service',
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        is_published: !!r.published,
      }));
      let filteredReviews = mapped;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredReviews = mapped.filter(review => 
          review.user.first_name.toLowerCase().includes(term) ||
          review.user.last_name.toLowerCase().includes(term) ||
          review.service_type.toLowerCase().includes(term) ||
          review.comment.toLowerCase().includes(term)
        );
      }
      if (filter !== 'all') {
        const isPublished = filter === 'published';
        filteredReviews = filteredReviews.filter(review => review.is_published === isPublished);
      }
      setReviews(filteredReviews);
      setTotalPages(Math.ceil(filteredReviews.length / itemsPerPage));
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load reviews. Please try again.');
      console.error('Error fetching reviews:', err);
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const toggleReviewStatus = async (reviewId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unpublish' : 'publish'} this review?`)) {
      return;
    }

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const resp = await fetch(`${apiBase}/api/admin/reviews/${reviewId}/publish/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ published: !currentStatus }),
      });
      if (!resp.ok) throw new Error('Failed to update review');
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, is_published: !currentStatus } : r));
      toast.success(`Review ${!currentStatus ? 'published' : 'unpublished'} successfully`);
    } catch (err) {
      setError(err.message || 'Failed to update review status');
      toast.error('Failed to update review status');
      console.error('Error updating review status:', err);
    }
  };

  const deleteReview = async (reviewId) => {
    // Optional: implement delete endpoint later; for now, no-op with notice
    toast('Delete not implemented', { icon: 'ℹ️' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reviews Management</h1>
            <Link 
              href="/dashboard/admin"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex-1">
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                  >
                    Search
                  </button>
                </form>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Reviews</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="p-10 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                <p>No reviews found. Try adjusting your search or filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rating
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Comment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {review.user.first_name} {review.user.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-300">{review.service_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{review.rating}/5</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">{review.comment}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-300">{formatDate(review.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${review.is_published ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                            {review.is_published ? 'Published' : 'Unpublished'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => toggleReviewStatus(review.id, review.is_published)}
                            className={`text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3`}
                          >
                            {review.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, reviews.length)}
                      </span>{' '}
                      of <span className="font-medium">{reviews.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {[...Array(totalPages)].map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${currentPage === idx + 1 ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900 dark:border-indigo-500 dark:text-indigo-200' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'} text-sm font-medium`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}