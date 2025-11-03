'use client';

export default function DashboardLayout({ children }) {
  // Client-side auth checks are handled within individual pages and middleware.
  // Keeping the layout passive prevents double redirects/loops.
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
