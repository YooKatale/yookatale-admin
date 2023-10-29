import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DB_URL } from '@config/config';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("https://yookatale-server.onrender.com/admin/product/get");
      if (response.status === 200) {
        setProducts(response.data);
      }
      console.log(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingProduct({ ...product }); // Create a copy of the product for editing
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleSaveEdit = async () => {
    if (editingProduct) {
      console.log(editingProduct)
      const data = {
        _id : editingProduct._id,
        product: {
          ...editingProduct
        }
      }
      try {
        const res = await axios.put(`https://yookatale-server.onrender.com/admin/product/edit/${editingProduct._id}`, data);
        console.log('Response data before updating state:', res.data);
        if (res.status === 200) {
          setProducts((prevProducts) =>
            prevProducts.map((p) => (p._id === editingProduct._id ? editingProduct : p))
          );
          setEditingProduct(null);
        } else {
          // Handle errors
        }
      } catch (error) {
        console.error('Error updating product:', error);
        // Handle errors
      }
    }
  };

  return (
    <div>
      <h1>Products</h1>

      <ul>
        {products.length > 0 ? (
          products.map((product) => (
            <li key={product._id}>
              {editingProduct && editingProduct._id === product._id ? (
                <div>
                  <form>
                    <label>Name:</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                    <label>Discount Percentage:</label>
                    <input
                      type="text"
                      value={editingProduct.discountPercentage}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, discountPercentage: e.target.value })
                      }
                    />
                    <label>Description:</label>
                    <input
                      type="text"
                      value={editingProduct.description}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, description: e.target.value })
                      }
                    />
                    <label>Price:</label>
                    <input
                      type="text"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    />
                    <label>Category:</label>
                    <input
                      type="text"
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, category: e.target.value })
                      }
                    />
                    <label>Subcategory:</label>
                    <input
                      type="text"
                      value={editingProduct.subCategory}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, subCategory: e.target.value })
                      }
                    />
                    <label>Unit:</label>
                    <input
                      type="text"
                      value={editingProduct.unit}
                      onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    />
                    <label>Images:</label>
                    <input
                      type="text"
                      value={editingProduct.images.join(', ')}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          images: e.target.value.split(', ').map((img) => img.trim()),
                        })
                      }
                    />
                  </form>
                  <button onClick={handleSaveEdit}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </div>
              ) : (
                <div>
                  <strong>Name:</strong> {product.name}
                  <br />
                  <strong>Discount Percentage:</strong> {product.discountPercentage}
                  <br />
                  <strong>Description:</strong> {product.description}
                  <br />
                  <strong>Price:</strong> {product.price}
                  <br />
                  <strong>Category:</strong> {product.category}
                  <br />
                  <strong>Subcategory:</strong> {product.subCategory}
                  <br />
                  <strong>Unit:</strong> {product.unit}
                  <br />
                  <strong>Images:</strong> {product.images.join(', ')}
                  <br />
                  <button onClick={() => handleEdit(product)}>Edit</button>
                </div>
              )}
            </li>
          ))
        ) : (
          <li>No products available</li>
        )}
      </ul>
    </div>
  );
};

export default Product;
