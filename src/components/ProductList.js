mport React, { useDeferredValue } from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products }) => {
  const deferredProducts = useDeferredValue(products);

  return (
    <div className="row">
      {deferredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;