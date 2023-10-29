"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { DB_URL } from '@config/config';

const EditProduct = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    subCategory: product.subCategory,
    discountPercentage: product.discountPercentage,
    unit: product.unit,
  });

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`https://yookatale-server.onrender.com/admin/product/edit/${product._id}`, formData);
      if (res.status === 200) {
        onClose(); // Close the editing form or modal
      } else {
        // Handle errors
      }
    } catch (error) {
      console.error('Error updating product:', error);
      // Handle errors
    }
  };

  return (
    <div>
      <h2>Edit Product</h2>
      <form onSubmit={handleUpdate}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <label>Price:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
        <label>Category:</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
        {/* Add the remaining fields here */}
        <label>Subcategory:</label>
        <input
          type="text"
          name="subCategory"
          value={formData.subCategory}
          onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
        />
        <label>Discount Percentage:</label>
        <input
          type="text"
          name="discountPercentage"
          value={formData.discountPercentage}
          onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
        />
        <label>Unit:</label>
        <input
          type="text"
          name="unit"
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
        />
        {/* Add other fields as needed */}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProduct;
