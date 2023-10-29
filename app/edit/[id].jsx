"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DB_URL } from '@config/config';
import { useRouter } from 'next/router';

const EditProduct = () => {
  const [product, setProduct] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
  });
  const router = useRouter();
  const { _id } = router.query;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${DB_URL}/products`);
        if (res.status === 200) {
          setProduct(res.data);
          setFormData({
            name: res.data.name,
            description: res.data.description,
            price: res.data.price,
            category: res.data.category,
          });
        }
      } catch (error) {
        console.error('Error fetching product data: ', error);
      }
    };

    fetchProduct();
  }, [_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${DB_URL}/products/${_id}`, formData);
      if (res.status === 200) {
        router.push(`/products/${_id}`);
      }
    } catch (error) {
      console.error('Error updating product: ', error);
    }
  };

  return (
    <div>
      <h1>Edit Product</h1>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProduct;
