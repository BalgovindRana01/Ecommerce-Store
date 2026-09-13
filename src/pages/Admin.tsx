import { useState, useEffect } from 'react';
import { API_URL } from '../utils/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  stock: number;
  image_url: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    image_url: ''
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products/`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/products/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
          stock: parseInt(productForm.stock) || 0,
          image_url: productForm.image_url
        })
      });

      if (response.ok) {
        alert('Product added successfully!');
        setProductForm({ name: '', description: '', price: '', category_id: '', stock: '', image_url: '' });
        loadProducts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/products/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          description: categoryForm.description
        })
      });

      if (response.ok) {
        alert('Category added successfully!');
        setCategoryForm({ name: '', description: '' });
        loadCategories();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-300">Manage your store products and categories</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-white/10 backdrop-blur-xl rounded-xl p-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Categories ({categories.length})
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Add Product Form */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Add New Product
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-purple-400 focus:outline-none"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-purple-400 focus:outline-none resize-none"
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-purple-400 focus:outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-purple-400 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="product-category" className="block text-sm font-medium mb-2">Category</label>
                  <select
                    id="product-category"
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <input
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-purple-400 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-linear-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </form>
            </div>

            {/* Products List */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Existing Products
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map(product => (
                  <div key={product.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{product.name}</p>
                        <p className="text-purple-300 font-medium">₹{product.price}</p>
                        <p className="text-sm text-gray-400">Stock: {product.stock}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No products yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Add Category Form */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Add New Category
              </h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category Name *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-purple-400 focus:outline-none"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-purple-400 focus:outline-none resize-none"
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-linear-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Existing Categories
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {categories.map(category => (
                  <div key={category.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-gray-400">{category.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No categories yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;