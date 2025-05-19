"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { getProducts, Product } from "../../api/apiService";

const ProductsPage = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on component mount using centralized API service
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="container mx-auto px-4 pt-16">
          <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-12">
            Our Products
          </h1>

          {/* Loading and Error States */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200"
                  >
                    {product.imageUrl && (
                      <div className="mb-4 overflow-hidden rounded-lg h-48">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h2>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-indigo-600">${product.price}</span>
                      <Link href={`/products/${product.id}`}>
                        <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors duration-300">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-xl text-gray-600">No products available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsPage;