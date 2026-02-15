import { ShoppingBag, Check } from 'lucide-react';
import { Product, useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {product.category}
        </span>
        <h3 className="text-sm font-bold mt-1 line-clamp-2 text-card-foreground">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-extrabold text-primary">
            R$ 10
          </span>
          <button
            onClick={handleAdd}
            className={`rounded-full p-2 transition-all duration-300 ${
              added
                ? 'bg-green-500 text-primary-foreground scale-110'
                : 'brand-gradient text-primary-foreground hover:shadow-brand hover:scale-105'
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
