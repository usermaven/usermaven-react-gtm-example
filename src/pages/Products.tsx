import React from 'react';
import ProductCard from '../components/ProductCard';

const products = [
  { id: 1, name: 'Laptop', price: 999.99, image: 'https://images.placeholders.dev/?width=300&height=300&fontSize=30' },
  { id: 2, name: 'Smartphone', price: 699.99, image: 'https://images.placeholders.dev/?width=300&height=300&fontSize=30' },
  { id: 3, name: 'Headphones', price: 199.99, image: 'https://images.placeholders.dev/?width=300&height=300&fontSize=30' },
  { id: 4, name: 'Smartwatch', price: 299.99, image: 'https://images.placeholders.dev/?width=300&height=300&fontSize=30' },
  { id: 5, name: 'Tablet', price: 499.99, image: 'https://images.placeholders.dev/?width=300&height=300&fontSize=30' },
  { id: 6, name: 'Camera', price: 799.99, image: 'https://images.placeholders.dev/?width=300&height=300&fontSize=30' },
];

const Products: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
          />
        ))}
      </div>
    </div>
  );
};

export default Products;