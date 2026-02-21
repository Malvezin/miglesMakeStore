import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Clock, Package, Truck, CheckCircle, AlertCircle, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderItem {
    product: {
        name: string;
        image: string;
    };
    quantity: number;
}

interface Order {
    id: string;
    created_at: string;
    total: number;
    status: string;
    items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
    pago_simulado: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    preparando: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: Clock },
    enviado: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
    finalizado: { label: 'Finalizado', color: 'bg-slate-100 text-slate-800', icon: CheckCircle },
};

const MyOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setOrders(data);
            setLoading(false);
        };

        fetchOrders();
    }, [user]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="text-muted-foreground">Carregando seus pedidos...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
                <p className="text-muted-foreground mb-6">Você precisa estar logado para ver seus pedidos.</p>
                <Link to="/login" className="brand-gradient text-primary-foreground font-bold rounded-full px-8 py-3">
                    Fazer Login
                </Link>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Você ainda não tem pedidos</h1>
                <p className="text-muted-foreground mb-8">Que tal aproveitar nossas ofertas de R$ 10?</p>
                <Link to="/produtos" className="brand-gradient text-primary-foreground font-bold rounded-full px-8 py-3">
                    Ir para Loja
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-extrabold text-foreground mb-8">Meus Pedidos</h1>

            <div className="space-y-6">
                {orders.map(order => {
                    const config = statusConfig[order.status] || { label: order.status, color: 'bg-gray-100', icon: Package };
                    const StatusIcon = config.icon;

                    return (
                        <div key={order.id} className="bg-card rounded-2xl shadow-card border p-6">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Pedido</p>
                                    <p className="font-mono text-sm font-bold">#{order.id.slice(0, 8)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Data</p>
                                    <p className="text-sm font-bold">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total</p>
                                    <p className="text-sm font-extrabold text-primary">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                                </div>
                                <Badge className={`${config.color} border-none font-bold px-3 py-1 flex items-center gap-1.5`}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {config.label}
                                </Badge>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm font-bold mb-3">Itens:</p>
                                <div className="flex flex-wrap gap-2">
                                    {order.items?.map((item, idx) => (
                                        <span key={idx} className="inline-flex items-center bg-secondary/50 rounded-lg px-3 py-1.5 text-xs font-medium">
                                            {item.quantity}x {item.product.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyOrders;
