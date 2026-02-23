import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_email: '',
    items_raw: '',
    total: '',
    status: 'pago_simulado'
  });

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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Parse items from raw text (one per line)
      const items = newOrder.items_raw
        .split('\n')
        .filter(line => line.trim())
        .map(line => ({
          product: { name: line.trim() },
          quantity: 1
        }));

      const { error } = await supabase.from('orders').insert({
        customer_name: newOrder.customer_name,
        customer_email: newOrder.customer_email,
        items: items,
        total: parseFloat(newOrder.total) || 0,
        status: newOrder.status,
        user_id: null // Manual order
      });

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Pedido manual criado com sucesso!' });
      setIsDialogOpen(false);
      setNewOrder({
        customer_name: '',
        customer_email: '',
        items_raw: '',
        total: '',
        status: 'pago_simulado'
      });
      fetchOrders();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado";
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Pedido Manual</DialogTitle>
              <DialogDescription>
                Preencha os dados do pedido abaixo. Pedidos manuais não são vinculados a usuários.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Cliente</Label>
                  <Input
                    id="name"
                    required
                    value={newOrder.customer_name}
                    onChange={e => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email do Cliente</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={newOrder.customer_email}
                    onChange={e => setNewOrder({ ...newOrder, customer_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="items">Produtos (um por linha)</Label>
                <Textarea
                  id="items"
                  placeholder="Ex: Produto A&#10;Produto B"
                  className="min-h-[100px]"
                  required
                  value={newOrder.items_raw}
                  onChange={e => setNewOrder({ ...newOrder, items_raw: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total">Valor Total (R$)</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    required
                    value={newOrder.total}
                    onChange={e => setNewOrder({ ...newOrder, total: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status Inicial</Label>
                  <Select
                    value={newOrder.status}
                    onValueChange={v => setNewOrder({ ...newOrder, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirmar Pedido
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum pedido encontrado.</TableCell></TableRow>
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
