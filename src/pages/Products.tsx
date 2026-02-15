import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { products, categories } from '@/data/products';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filtered = activeCategory === 'Todos'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-foreground">Nossos Produtos</h1>
        <p className="text-muted-foreground mt-2">Todos por R$ 10,00 💕</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              activeCategory === cat
                ? 'brand-gradient text-primary-foreground shadow-brand'
                : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Nenhum produto encontrado nesta categoria.
        </p>
      )}
    </div>
  );
};

export default Products;
