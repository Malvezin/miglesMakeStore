import { Link } from 'react-router-dom';
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react';

const OrderConfirmation = () => {
    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
            </div>

            <h1 className="text-3xl font-extrabold text-foreground mb-4">
                Obrigado pela sua compra!
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Seu pedido já está sendo preparado com todo carinho e em breve será enviado.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                    to="/meus-pedidos"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 brand-gradient text-primary-foreground font-bold rounded-full px-8 py-3 hover:shadow-brand transition-all"
                >
                    <Package className="w-5 h-5" />
                    Ver Meus Pedidos
                </Link>

                <Link
                    to="/produtos"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-bold rounded-full px-8 py-3 hover:bg-secondary/80 transition-all"
                >
                    <ShoppingBag className="w-5 h-5" />
                    Continuar Comprando
                </Link>
            </div>
        </div>
    );
};

export default OrderConfirmation;
