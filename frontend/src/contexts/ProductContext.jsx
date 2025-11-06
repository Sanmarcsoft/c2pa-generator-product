import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';

/**
 * ProductContext - Centralized state management for multi-product certification
 *
 * Provides product management functionality including CRUD operations,
 * product selection, and localStorage persistence for selected product.
 *
 * @context ProductContext
 */
const ProductContext = createContext(null);

/**
 * Custom hook to access product context
 * @throws {Error} If used outside of ProductProvider
 * @returns {Object} Product context value
 */
export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

/**
 * ProductProvider Component
 *
 * Wraps the application to provide product context to all children.
 * Handles product state management, API interactions, and persistence.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const ProductProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all products for the authenticated user
   */
  const fetchProducts = async () => {
    if (!isAuthenticated || !token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);

      // Restore selected product from localStorage if it exists
      const storedProductId = localStorage.getItem('selectedProductId');
      if (storedProductId) {
        const storedProduct = data.products?.find(p => p.id === storedProductId);
        if (storedProduct) {
          setSelectedProduct(storedProduct);
        } else if (data.products && data.products.length > 0) {
          // If stored product not found, select first product
          setSelectedProduct(data.products[0]);
          localStorage.setItem('selectedProductId', data.products[0].id);
        }
      } else if (data.products && data.products.length > 0) {
        // No stored product, select first one
        setSelectedProduct(data.products[0]);
        localStorage.setItem('selectedProductId', data.products[0].id);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh products list from API
   */
  const refreshProducts = async () => {
    await fetchProducts();
  };

  /**
   * Select a product as the currently active product
   * @param {string} productId - ID of the product to select
   */
  const selectProduct = async (productId) => {
    if (!productId) {
      console.error('Product ID is required');
      return;
    }

    // Find the product in the current list
    const product = products.find(p => p.id === productId);

    if (!product) {
      console.error(`Product with ID ${productId} not found`);
      return;
    }

    // Update selected product
    setSelectedProduct(product);

    // Persist to localStorage
    localStorage.setItem('selectedProductId', productId);
  };

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @param {string} productData.name - Product name
   * @param {string} productData.description - Product description
   * @param {string} productData.product_type - Product type
   * @returns {Object} Created product or error
   */
  const createProduct = async (productData) => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Authentication required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      // Add to products list
      const newProducts = [...products, data.product];
      setProducts(newProducts);

      // Automatically select the new product
      setSelectedProduct(data.product);
      localStorage.setItem('selectedProductId', data.product.id);

      return { success: true, product: data.product };
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing product
   * @param {string} productId - ID of the product to update
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated product or error
   */
  const updateProduct = async (productId, updates) => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Authentication required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      // Update in products list
      const updatedProducts = products.map(p =>
        p.id === productId ? data.product : p
      );
      setProducts(updatedProducts);

      // Update selected product if it's the one being updated
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct(data.product);
      }

      return { success: true, product: data.product };
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a product
   * @param {string} productId - ID of the product to delete
   * @returns {Object} Success status or error
   */
  const deleteProduct = async (productId) => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Authentication required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      // Remove from products list
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);

      // If the deleted product was selected, select another one
      if (selectedProduct && selectedProduct.id === productId) {
        if (updatedProducts.length > 0) {
          setSelectedProduct(updatedProducts[0]);
          localStorage.setItem('selectedProductId', updatedProducts[0].id);
        } else {
          setSelectedProduct(null);
          localStorage.removeItem('selectedProductId');
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get product progress details
   * @param {string} productId - ID of the product
   * @returns {Object} Progress data or error
   */
  const getProductProgress = async (productId) => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await fetch(`/api/products/${productId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product progress');
      }

      return { success: true, progress: data.progress };
    } catch (err) {
      console.error('Error fetching product progress:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Load products when user authenticates
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProducts();
    } else {
      // Clear products when user logs out
      setProducts([]);
      setSelectedProduct(null);
      localStorage.removeItem('selectedProductId');
    }
  }, [isAuthenticated, user]);

  const value = {
    // State
    products,
    selectedProduct,
    loading,
    error,

    // Methods
    selectProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    getProductProgress,

    // Computed
    hasProducts: products.length > 0,
    productCount: products.length,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

ProductProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProductContext;
