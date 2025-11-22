import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [editedProduct, setEditedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/products/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProduct(data);
      setEditedProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header once JWT is implemented fully on frontend
        },
        body: JSON.stringify(editedProduct),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      setIsEditing(false);
      fetchProduct(); // Refresh data after update
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading product details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div>
      <h1>Product Details</h1>
      {!isEditing ? (
        <div>
          <p><strong>Name:</strong> {product.name}</p>
          <p><strong>SKU/Code:</strong> {product.sku}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Unit of Measure:</strong> {product.unit_of_measure}</p>
          <p><strong>Initial Stock:</strong> {product.initial_stock}</p>
          <button onClick={() => setIsEditing(true)}>Edit Product</button>
        </div>
      ) : (
        <form onSubmit={handleUpdateProduct}>
          <label>
            Name:
            <input type="text" name="name" value={editedProduct.name} onChange={handleInputChange} required />
          </label><br/>
          <label>
            SKU/Code:
            <input type="text" name="sku" value={editedProduct.sku} onChange={handleInputChange} required />
          </label><br/>
          <label>
            Category:
            <input type="text" name="category" value={editedProduct.category} onChange={handleInputChange} required />
          </label><br/>
          <label>
            Unit of Measure:
            <input type="text" name="unit_of_measure" value={editedProduct.unit_of_measure} onChange={handleInputChange} required />
          </label><br/>
          <label>
            Initial Stock:
            <input type="number" name="initial_stock" value={editedProduct.initial_stock} onChange={handleInputChange} />
          </label><br/>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}

export default ProductDetailPage;
