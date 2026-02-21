import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ShieldCheck, AlertCircle, Loader2, ChevronLeft } from 'lucide-react';

const Checkout = () => {
    const { items, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    // Form states (fake validations only)
    const [formData, setFormData] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsProcessing(true);
        try {
            // 1. Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .maybeSingle();

            // 2. Create order in Supabase
            const { error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    customer_name: profile?.full_name || user.email?.split('@')[0] || 'Cliente',
                    customer_email: user.email,
                    items: items,
                    total: totalPrice,
                    status: 'pago_simulado'
                });

            if (orderError) throw orderError;

            // 3. Clear cart and redirect
            clearCart();
            toast({
                title: "Pedido confirmado!",
                description: "Seu pagamento simulado foi processado com sucesso.",
            });
            navigate('/confirmacao');
        } catch (error: any) {
            toast({
                title: "Erro ao processar pedido",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        navigate('/carrinho');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <button
                onClick={() => navigate('/carrinho')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 font-medium"
            >
                <ChevronLeft className="w-4 h-4" />
                Voltar ao carrinho
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Form */}
                <div className="space-y-6">
                    <div className="bg-card rounded-2xl p-6 shadow-card border">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold">Pagamento</h2>
                                <p className="text-xs text-muted-foreground">Insira os dados do seu cartão (simulado)</p>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmOrder} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
                                    Nome no Cartão
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: MARIA S OLIVEIRA"
                                    className="w-full bg-secondary/50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={formData.cardName}
                                    onChange={e => setFormData({ ...formData, cardName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
                                    Número do Cartão
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full bg-secondary/50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                    value={formData.cardNumber}
                                    onChange={e => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                                    maxLength={19}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
                                        Validade
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="MM/AA"
                                        className="w-full bg-secondary/50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={formData.expiry}
                                        onChange={e => setFormData({ ...formData, expiry: e.target.value.replace(/\D/g, '').replace(/(\d{2})/, '$1/').trim() })}
                                        maxLength={5}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="123"
                                        className="w-full bg-secondary/50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={formData.cvv}
                                        onChange={e => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                                        maxLength={4}
                                    />
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mt-6">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                    <strong>Pagamento Simulado:</strong> Nenhum dado real é coletado ou utilizado. Esta tela serve apenas para testes do fluxo de pedidos.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full brand-gradient text-primary-foreground font-bold rounded-full py-4 text-lg hover:shadow-brand hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
                                {isProcessing ? 'Confirmando...' : `Pagar R$ ${totalPrice.toFixed(2).replace('.', ',')}`}
                            </button>
                        </form>

                        <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Pagamento 100% Seguro</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="space-y-6">
                    <div className="bg-card rounded-2xl p-6 shadow-card border sticky top-24">
                        <h2 className="text-xl font-extrabold mb-6">Resumo do Pedido</h2>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6 scrollbar-hide">
                            {items.map(item => (
                                <div key={item.product.id} className="flex gap-4">
                                    <div className="relative">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-card">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <h3 className="font-bold text-xs text-card-foreground line-clamp-2">{item.product.name}</h3>
                                        <p className="text-muted-foreground text-[10px] font-bold mt-1 uppercase">Qtd: {item.quantity}</p>
                                    </div>
                                    <div className="py-1">
                                        <p className="font-extrabold text-sm text-foreground">R$ {(10 * item.quantity).toFixed(2).replace('.', ',')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Subtotal</span>
                                <span className="font-bold">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Frete</span>
                                <span className="text-green-600 font-bold uppercase text-xs">Grátis</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t">
                                <span className="text-lg font-extrabold">Total</span>
                                <span className="text-2xl font-extrabold text-primary">
                                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
