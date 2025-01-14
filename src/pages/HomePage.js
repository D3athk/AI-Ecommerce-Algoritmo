import React, { useState, useEffect, useTransition } from 'react';
import ProductList from '../components/ProductList';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        startTransition(() => {
          setProducts(data);  // Updates products inside transition for improved UX
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // The effect runs once when the component mounts

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Featured Products</h1>
      <ProductList products={products} />
      {isPending && <p>Loading more products...</p>}  {/* Display loading indication when data is pending */}
    </div>
  );
};



export default HomePage;