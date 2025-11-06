import { useState } from 'react';
import { useProduct } from '../contexts/ProductContext';
import { useNavigate } from 'react-router-dom';
import './C2PAProductsPage.css';

/**
 * C2PAProductsPage - Manage multiple Generator Products
 *
 * Allows users to view, create, update, and delete their products.
 * Each product represents a separate certification journey.
 */
function C2PAProductsPage() {
  const {
    products,
    selectedProduct,
    selectProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    loading,
    error
  } = useProduct();

  const navigate = useNavigate();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    product_type: 'generator'
  });
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      product_type: 'generator'
    });
    setFormError(null);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowCreateForm(true);
    setFormData({
      name: product.name,
      description: product.description || '',
      product_type: product.product_type || 'generator'
    });
    setFormError(null);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      product_type: 'generator'
    });
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.name.trim()) {
      setFormError('Product name is required');
      return;
    }

    setSaving(true);

    try {
      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct.id, formData);
      } else {
        result = await createProduct(formData);
      }

      if (result.success) {
        handleCancelForm();
        if (!editingProduct) {
          // Navigate to progress page for new product
          navigate('/progress');
        }
      } else {
        setFormError(result.error || 'Failed to save product');
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This will remove all associated documents and progress.`)) {
      return;
    }

    setSaving(true);
    const result = await deleteProduct(product.id);
    setSaving(false);

    if (!result.success) {
      alert(`Failed to delete product: ${result.error}`);
    }
  };

  const handleSelectProduct = (product) => {
    selectProduct(product.id);
    navigate('/progress');
  };

  if (loading && products.length === 0) {
    return (
      <div className="c2pa-products-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="c2pa-products-page">
      <div className="page-header">
        <h1 className="page-title">C2PA PRODUCTS</h1>
        <button
          className="btn-primary"
          onClick={handleCreateClick}
          disabled={saving}
        >
          + Create New Product
        </button>
      </div>

      {error && (
        <div className="error-banner retro-card">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="product-form-modal">
          <div className="product-form retro-card">
            <h2>{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>

            {formError && (
              <div className="form-error">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="product-name">Product Name *</label>
                <input
                  type="text"
                  id="product-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My Generator Product v2"
                  disabled={saving}
                  maxLength={255}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your generator product"
                  disabled={saving}
                  rows={4}
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-type">Product Type</label>
                <select
                  id="product-type"
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  disabled={saving}
                >
                  <option value="generator">Generator Product</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelForm}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="empty-state retro-card">
          <h2>NO PRODUCTS YET</h2>
          <p>Create your first Generator Product to begin the C2PA certification process.</p>
          <button className="btn-primary" onClick={handleCreateClick}>
            Create Your First Product
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div
              key={product.id}
              className={`product-card retro-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
            >
              <div className="product-card-header">
                <h3>{product.name}</h3>
                {selectedProduct?.id === product.id && (
                  <span className="selected-badge">SELECTED</span>
                )}
              </div>

              <div className="product-card-body">
                <p className="product-description">
                  {product.description || 'No description provided'}
                </p>

                <div className="product-meta">
                  <span className={`status-badge ${product.status}`}>
                    {product.status.toUpperCase()}
                  </span>
                  <span className="product-type-badge">
                    {product.product_type || 'generator'}
                  </span>
                </div>

                <div className="product-dates">
                  <small>Created: {new Date(product.created_at).toLocaleDateString()}</small>
                  {product.updated_at && (
                    <small>Updated: {new Date(product.updated_at).toLocaleDateString()}</small>
                  )}
                </div>
              </div>

              <div className="product-card-actions">
                <button
                  className="btn-select"
                  onClick={() => handleSelectProduct(product)}
                  disabled={selectedProduct?.id === product.id || saving}
                >
                  {selectedProduct?.id === product.id ? 'Selected' : 'Select'}
                </button>
                <button
                  className="btn-edit"
                  onClick={() => handleEditClick(product)}
                  disabled={saving}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteClick(product)}
                  disabled={saving}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="products-summary retro-card">
        <h3>Summary</h3>
        <p>Total Products: <strong>{products.length}</strong></p>
        {selectedProduct && (
          <p>Current Product: <strong>{selectedProduct.name}</strong></p>
        )}
      </div>
    </div>
  );
}

export default C2PAProductsPage;
