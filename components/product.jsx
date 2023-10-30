import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from '@components/ui/table';

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
    setEditingProduct({ ...product });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleSaveEdit = async () => {
    if (editingProduct) {
      console.log(editingProduct);
      const data = {
        _id: editingProduct._id,
        product: {
          ...editingProduct,
        },
      };
      try {
        const res = await axios.put(`https://yookatale-server.onrender.com/admin/product/edit/${editingProduct._id}`, data);
        if (res.status === 200) {
          setProducts((prevProducts) =>
            prevProducts.map((p) => (p._id === editingProduct._id ? editingProduct : p))
          );
          setEditingProduct(null);
        } else {
        }
      } catch (error) {
        console.error('Error updating product:', error);
      }
    }
  };

  return (
    <div>
      <h1>Products</h1>
      <Table>
        <TableCaption>Product List</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Discount Percentage</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Subcategory</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? (
            products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  {editingProduct && editingProduct._id === product._id ? (
                    <div>
                      <form className="space-y-4">
                        <div className="flex flex-col">
                          <label
                            className="text-sm font-semibold"
                            htmlFor="name"
                          >
                            Name:
                          </label>
                          <input
                            id="name"
                            type="text"
                            className="w-80 p-2 border border-gray-300 rounded-md"
                            value={editingProduct.name}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-col">
                          <label
                            className="text-sm font-semibold"
                            htmlFor="discountPercentage"
                          >
                            Discount Percentage:
                          </label>
                          <input
                            id="discountPercentage"
                            type="text"
                            className="w-80 p-2 border border-gray-300 rounded-md"
                            value={editingProduct.discountPercentage}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                discountPercentage: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-col">
                          <label
                            className="text-sm font-semibold"
                            htmlFor="description"
                          >
                            Description:
                          </label>
                          <input
                            id="description"
                            type="text"
                            className="w-80 p-2 border border-gray-300 rounded-md"
                            value={editingProduct.description}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-col">
                          <label
                            className="text-sm font-semibold"
                            htmlFor="price"
                          >
                            Price:
                          </label>
                          <input
                            id="price"
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={editingProduct.price}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                price: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-col">
                          <label
                            className="text-sm font-semibold"
                            htmlFor="category"
                          >
                            Category:
                          </label>
                          <input
                            id="category"
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={editingProduct.category}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                category: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-col">
                          <label
                            className="text-sm font-semibold"
                            htmlFor="subCategory"
                          >
                            Subcategory:
                          </label>
                          <input
                            id="subCategory"
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={editingProduct.subCategory}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                subCategory: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-col">
                          <label
                            className="text-sm font-semibold"
                            htmlFor="unit"
                          >
                            Unit:
                          </label>
                          <input
                            id="unit"
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={editingProduct.unit}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                unit: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-col">
                          <label
                            className="text-sm font-semibold"
                            htmlFor="images"
                          >
                            Images:
                          </label>
                          <input
                            id="images"
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={editingProduct.images.join(", ")}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                images: e.target.value
                                  .split(", ")
                                  .map((img) => img.trim()),
                              })
                            }
                          />
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div>{product.name}</div>
                  )}
                </TableCell>
                <TableCell>{product.discountPercentage}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.subCategory}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>
                  {editingProduct && editingProduct._id === product._id ? (
                    <div>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2 cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-red-500 mt-5 text-white px-2 py-1 rounded-md cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-500 text-white px-2 py-1 rounded-md cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="8">No products available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Product;

