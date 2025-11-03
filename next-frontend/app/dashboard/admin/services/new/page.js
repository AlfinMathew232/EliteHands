'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

export default function NewService() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      duration_hours: 1,
      category: '',
      is_active: true,
    },
  });

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBase}/api/services/categories/`);

        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Append all form data
    const payload = { ...data };
    // Ensure backend expects duration_hours
    if (payload.duration_minutes && !payload.duration_hours) {
      // Convert minutes to hours rounded up
      payload.duration_hours = Math.max(1, Math.ceil(Number(payload.duration_minutes) / 60));
      delete payload.duration_minutes;
    }
    Object.keys(payload).forEach(key => {
      formData.append(key, payload[key]);
    });
    
    // Image upload UI is present but backend does not support an image field yet.
    // Do not append the image file to avoid 400 errors for unknown field.

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(`${apiBase}/api/admin/services/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create service');
      }

      toast.success('Service created successfully!');
      router.push('/dashboard/admin/services');
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error(error.message || 'Failed to create service');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Service</h1>
          <p className="mt-2 text-sm text-gray-700">
            Fill in the details below to create a new service
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Service Name */}
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Service Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Service name is required' })}
                    className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="sm:col-span-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    {...register('category', { required: 'Category is required' })}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.category ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 0, message: 'Price must be positive' },
                    })}
                    className={`block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.price ? 'border-red-300' : ''
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* Duration */}
              <div className="sm:col-span-2">
                <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700">
                  Duration (hours) *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="duration_hours"
                    min="1"
                    {...register('duration_hours', {
                      required: 'Duration is required',
                      min: { value: 1, message: 'Duration must be at least 1 hour' },
                    })}
                    className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                      errors.duration_hours ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.duration_hours && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration_hours.message}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="sm:col-span-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="is_active"
                    {...register('is_active')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Add a detailed description of the service..."
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">Service Image</label>
                <div className="mt-1 flex items-center">
                  <div className="flex-shrink-0 h-24 w-24 overflow-hidden rounded-md border border-gray-200">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <svg
                          className="h-12 w-12"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload an image</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/admin/services')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Service'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
