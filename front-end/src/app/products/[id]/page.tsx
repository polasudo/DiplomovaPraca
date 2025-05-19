"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { getProductById, Product } from "../../../api/apiService";

const ProductDetailPage = () => {
  const params = useParams();
  const productId = params.id as string;
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = "https://ye03yy1hg3.execute-api.eu-central-1.amazonaws.com/v1";

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const data = await getProductById(productId);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product details');
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="container mx-auto px-4 pt-16">
          <Link href="/products" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </Link>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Product Detail */}
          {!loading && !error && product && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="md:flex">
                {product.imageUrl ? (
                  <div className="md:flex-shrink-0 md:w-1/3">
                    <img 
                      className="h-64 w-full object-cover md:h-full" 
                      src={product.imageUrl} 
                      alt={product.name} 
                    />
                  </div>
                ) : (
                  <div className="md:flex-shrink-0 md:w-1/3 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">No image available</span>
                  </div>
                )}
                
                <div className="p-8 md:w-2/3">
                  {product.category && (
                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">
                      {product.category}
                    </div>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-2xl font-bold text-indigo-600 mb-4">${product.price}</p>
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                  
                  {product.details && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Details</h2>
                      <p className="text-gray-600">{product.details}</p>
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <button 
                      className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-500 transition-colors duration-300"
                      onClick={() => alert('Add to cart functionality would be implemented here')}
                    >
                      Add to Cart
                    </button>
                    
                    {!isAuthenticated && (
                      <div className="mt-4 text-sm text-gray-600">
                        <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                          Sign in
                        </Link> to save items to your wishlist
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Product Not Found */}
          {!loading && !error && !product && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
              <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
              <Link href="/products">
                <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors duration-300">
                  Browse Products
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;