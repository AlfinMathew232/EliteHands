'use client';

import { useEffect, useState } from 'react';

export default function AdminServiceCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ id: null, name: '', description: '', icon: '', is_active: true });
  const [saving, setSaving] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const load = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${apiBase}/api/services/categories/`);
      if (!resp.ok) throw new Error('Failed to load categories');
      const data = await resp.json();
      setCategories(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      setError(e.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => setForm({ id: null, name: '', description: '', icon: '', is_active: true });

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name) { setError('Name is required'); return; }
    try {
      setSaving(true);
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const url = form.id ? `${apiBase}/api/admin/services/categories/${form.id}/` : `${apiBase}/api/admin/services/categories/`;
      const method = form.id ? 'PUT' : 'POST';
      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: form.name, description: form.description, icon: form.icon, is_active: form.is_active }),
      });
      if (!resp.ok) throw new Error('Failed to save category');
      resetForm();
      await load();
    } catch (e) {
      setError(e.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const edit = (cat) => setForm({ id: cat.id, name: cat.name, description: cat.description || '', icon: cat.icon || '', is_active: !!cat.is_active });

  const remove = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const resp = await fetch(`${apiBase}/api/admin/services/categories/${id}/`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error('Failed to delete');
      await load();
    } catch (e) {
      setError(e.message || 'Failed to delete');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Service Categories</h1>
          <p className="mt-2 text-sm text-gray-700">Create, update, and delete service categories.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{form.id ? 'Edit Category' : 'New Category'}</h2>
          {error && <div className="mb-3 rounded bg-red-50 border border-red-200 text-red-700 p-2 text-sm">{error}</div>}
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input name="name" value={form.name} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" rows={3} value={form.description} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Icon (optional)</label>
              <input name="icon" value={form.icon} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input id="is_active" type="checkbox" name="is_active" checked={form.is_active} onChange={onChange} />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
            </div>
            <div className="flex justify-end gap-2">
              {form.id && <button type="button" onClick={resetForm} className="px-4 py-2 rounded border">Cancel</button>}
              <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-gray-500">No categories found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">{c.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{c.is_active ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => edit(c)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                        <button onClick={() => remove(c.id)} className="text-red-600 hover:text-red-900">Delete</button>
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
