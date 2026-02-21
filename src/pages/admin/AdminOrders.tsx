import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface OrderDetail {
  id: string;
  created_at: string;
  status: string;
  total: number;
  customer_name: string;
  customer_email: string;
  items: {
    product: {
      name: string;
    };
    quantity: number;
  }[];
  archived: boolean;
}

type Order = OrderDetail;

const statuses = ['pago_simulado', 'preparando', 'enviado', 'finalizado'];

const statusColor: Record<string, string> = {
  pago_simulado: 'bg-green-100 text-green-800',
  preparando: 'bg-blue-100 text-blue-800',
  enviado: 'bg-purple-100 text-purple-800',
  finalizado: 'bg-slate-100 text-slate-800',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('archived', false)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Status atualizado!' }); fetchOrders(); }
  };

  const archiveOrder = async (id: string) => {
    const { error } = await supabase.from('orders').update({ archived: true }).eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Pedido encerrado!' }); fetchOrders(); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum pedido encontrado.</TableCell></TableRow>
            ) : orders.map(o => (
              <TableRow key={o.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-muted-foreground">#{o.id.slice(0, 8)}</span>
                    <span className="text-xs">{new Date(o.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{o.customer_name || 'N/A'}</span>
                    <span className="text-[10px] text-muted-foreground">{o.customer_email || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] flex flex-wrap gap-1">
                    {(o.items || []).map((item, idx) => (
                      <span key={idx} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                        {item.quantity}x {item.product.name}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-bold">R$ {o.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={`${statusColor[o.status] || ''} border-none`}>{o.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    {o.status === 'finalizado' && (
                      <button
                        onClick={() => archiveOrder(o.id)}
                        className="w-[130px] h-8 text-[10px] font-bold bg-secondary hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-md border"
                      >
                        Encerrar Pedido
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminOrders;
