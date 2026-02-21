import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Product } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface DBProduct {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  image: string | null;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error fetching products:', error);
        return;
      }
      if (data) {
        setProducts(data.map((p: DBProduct) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          image: p.image_url || p.image || ''
        })) || []);
      };
    };

    fetchProducts();
  }, []);

  const featured = products.slice(0, 8);

  return (
    <div>
      <Hero />

      {/* Price banner */}
      <div className="bg-secondary py-3">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-secondary-foreground">💄 Maquiagem</span>
          <span className="text-primary">•</span>
          <span className="text-sm font-bold text-secondary-foreground">✨ Skincare</span>
          <span className="text-primary">•</span>
          <span className="text-sm font-bold text-secondary-foreground">💍 Acessórios</span>
          <span className="text-primary">•</span>
          <span className="text-sm font-bold text-secondary-foreground">💅 Unhas</span>
          <span className="text-primary">•</span>
          <span className="text-sm font-bold text-secondary-foreground">🎁 Variedades</span>
        </div>
      </div>

      {/* Featured products */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Destaques da Semana
          </h2>
          <p className="text-muted-foreground mt-2">Tudo por apenas R$ 10,00 — sem exceção!</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/produtos"
            className="inline-flex brand-gradient text-primary-foreground font-bold rounded-full px-8 py-3 hover:shadow-brand hover:scale-105 transition-all"
          >
            Ver Todos os Produtos
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
