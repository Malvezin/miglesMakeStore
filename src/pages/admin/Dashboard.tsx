import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, admins: 0, revenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [productsRes, ordersRes, adminsRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total', { count: 'exact' }),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
      ]);

      const revenue = ordersRes.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      setStats({
        products: productsRes.count || 0,
        orders: ordersRes.count || 0,
        admins: adminsRes.count || 0,
        revenue,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Produtos', value: stats.products, icon: Package, color: 'text-primary' },
    { title: 'Pedidos', value: stats.orders, icon: ShoppingCart, color: 'text-accent' },
    { title: 'Usuários', value: stats.admins, icon: Users, color: 'text-secondary-foreground' },
    { title: 'Receita', value: `R$ ${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-primary' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
