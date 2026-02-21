import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para finalizar a compra.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-6">Adicione produtos incríveis por apenas R$ 10!</p>
        <Link
          to="/produtos"
          className="inline-flex brand-gradient text-primary-foreground font-bold rounded-full px-8 py-3 hover:shadow-brand transition-all"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Meu Carrinho</h1>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.product.id} className="bg-card rounded-xl p-4 shadow-card flex gap-4">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-card-foreground truncate">{item.product.name}</h3>
              <p className="text-primary font-extrabold mt-1">R$ 10,00</p>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button
              onClick={() => removeFromCart(item.product.id)}
              className="self-start p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-card rounded-xl p-6 shadow-card">
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground font-medium">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
          <span className="text-2xl font-extrabold text-foreground">
            R$ {totalPrice.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="w-full brand-gradient text-primary-foreground font-bold rounded-full py-3 text-lg hover:shadow-brand hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCheckingOut && <Loader2 className="w-5 h-5 animate-spin" />}
          {isCheckingOut ? 'Processando...' : 'Finalizar Compra'}
        </button>

        <button
          onClick={clearCart}
          className="w-full mt-3 text-sm text-muted-foreground hover:text-destructive transition-colors font-medium"
        >
          Limpar carrinho
        </button>
      </div>
    </div>
  );
};

export default Cart;
