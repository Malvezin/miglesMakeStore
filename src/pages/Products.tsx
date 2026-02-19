import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { categories } from '@/data/products';
import { supabase } from '@/lib/supabase';
import { Product } from '@/contexts/CartContext';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, image_url, category')
        .eq('active', true)
        .order('name');
      if (data) {
        setProducts(data.map(p => ({ id: p.id, name: p.name, image: p.image_url, category: p.category })));
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filtered = activeCategory === 'Todos'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-foreground">Nossos Produtos</h1>
        <p className="text-muted-foreground mt-2">Todos por R$ 10,00 💕</p>
      </div>

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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Nenhum produto encontrado nesta categoria.
        </p>
      )}
    </div>
  );
};

export default Products;
