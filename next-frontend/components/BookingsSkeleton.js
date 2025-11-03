export default function BookingsSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Filters Skeleton */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Header Skeleton */}
      <div className="hidden sm:block">
        <div className="bg-gray-50 px-6 py-3 grid grid-cols-12 gap-4">
          {['Booking ID', 'Customer', 'Service', 'Date & Time', 'Staff', 'Status', 'Actions'].map((header, i) => (
            <div key={i} className={`${i === 0 ? 'col-span-1' : i === 6 ? 'col-span-2' : 'col-span-2'}`}>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Rows Skeleton */}
      <div className="space-y-4 mt-2">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
            <div className="sm:hidden space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 items-center">
              <div className="col-span-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="col-span-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="mt-1 h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
              <div className="col-span-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="mt-1 h-3 bg-gray-100 rounded w-1/3"></div>
              </div>
              <div className="col-span-2">
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="col-span-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="col-span-2">
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="col-span-1 flex justify-end space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
        <div className="hidden sm:block">
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="flex-1 flex justify-between sm:justify-end">
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
          <div className="ml-3 h-10 w-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
