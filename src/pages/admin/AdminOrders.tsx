import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, Search, Minus, Trash2, ShoppingCart, Image as ImageIcon } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';

interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  price?: number; // assuming R$ 10 for now if not present, but using for flexibility
}

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
      image?: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    status: 'pago_simulado'
  });

  const [selectedItems, setSelectedItems] = useState<{ product: Product; quantity: number }[]>([]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('archived', false)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) {
      setProducts(data.map(p => ({
        id: p.id,
        name: p.name,
        image: p.image_url || p.image,
        category: p.category
      })));
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalPrice = useMemo(() => {
    // Current price is fixed at 10 based on CartContext
    return selectedItems.reduce((acc, item) => acc + (10 * item.quantity), 0);
  }, [selectedItems]);

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

  const handleAddItem = (product: Product) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setSelectedItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast({ title: 'Erro', description: 'Adicione pelo menos um produto.', variant: 'destructive' });
      return;
    }
    setIsCreating(true);

    try {
      const items = selectedItems.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          image: item.product.image
        },
        quantity: item.quantity
      }));

      const { error } = await supabase.from('orders').insert({
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        items: items,
        total: totalPrice,
        status: customerInfo.status,
        user_id: null // Manual order
      });

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Pedido manual criado com sucesso!' });
      setIsDialogOpen(false);
      setCustomerInfo({ name: '', email: '', status: 'pago_simulado' });
      setSelectedItems([]);
      setSearchTerm('');
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
            <Button className="gap-2 brand-gradient">
              <Plus className="w-4 h-4" />
              Criar Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-xl font-bold">Criar Pedido Manual</DialogTitle>
              <DialogDescription>
                Selecione os produtos e preencha os dados do cliente.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-1 overflow-hidden">
              {/* Product Selector Column */}
              <div className="w-3/5 flex flex-col border-r bg-secondary/20">
                <div className="p-4 border-b space-y-3 bg-card">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produto ou categoria..."
                      className="pl-9 h-10"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map(product => (
                      <div key={product.id} className="bg-card border rounded-xl p-3 flex flex-col gap-3 group hover:border-primary/50 transition-colors">
                        <div className="flex gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover bg-secondary"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold line-clamp-2 leading-tight h-8">{product.name}</h4>
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">{product.category}</p>
                            <p className="text-sm font-extrabold text-primary mt-1">R$ 10,00</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs font-bold gap-1.5 h-8 bg-secondary/80 hover:bg-primary hover:text-primary-foreground group-hover:brand-gradient"
                          onClick={() => handleAddItem(product)}
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar
                        </Button>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                      <p className="col-span-2 text-center text-muted-foreground py-12 text-sm">
                        Nenhum produto encontrado.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Order Info Column */}
              <div className="w-2/5 flex flex-col bg-card">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full brand-gradient text-white flex items-center justify-center text-[10px]">1</span>
                        Dados do Cliente
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome Completo</Label>
                          <Input
                            id="name"
                            className="h-9 text-sm"
                            required
                            value={customerInfo.name}
                            onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            className="h-9 text-sm"
                            required
                            value={customerInfo.email}
                            onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full brand-gradient text-white flex items-center justify-center text-[10px]">2</span>
                        Itens Selecionados ({selectedItems.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedItems.map(item => (
                          <div key={item.product.id} className="flex items-center gap-3 bg-secondary/30 p-2.5 rounded-xl border border-transparent hover:border-border transition-all">
                            <img src={item.product.image} className="w-10 h-10 rounded-md object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold truncate line-clamp-1">{item.product.name}</h5>
                              <p className="text-[10px] text-primary font-extrabold">R$ {(10 * item.quantity).toFixed(2).replace('.', ',')}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-card rounded-lg border p-1 scale-90">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-secondary transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold min-w-[20px] text-center">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-secondary transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.product.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {selectedItems.length === 0 && (
                          <div className="text-center py-8 border-2 border-dashed rounded-2xl">
                            <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Adicione produtos da lista ao lado</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full brand-gradient text-white flex items-center justify-center text-[10px]">3</span>
                        Status do Pedido
                      </h3>
                      <Select
                        value={customerInfo.status}
                        onValueChange={v => setCustomerInfo({ ...customerInfo, status: v })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-6 border-t bg-secondary/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-muted-foreground">Total do Pedido</span>
                    <span className="text-3xl font-extrabold text-primary">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <Button
                    className="w-full h-12 rounded-full brand-gradient font-bold text-lg hover:scale-[1.02] shadow-brand transition-all"
                    onClick={handleCreateOrder}
                    disabled={isCreating || selectedItems.length === 0}
                  >
                    {isCreating ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...</>
                    ) : (
                      'Finalizar Pedido'
                    )}
                  </Button>
                </div>
              </div>
            </div>
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
                  <div className="max-w-[250px] flex flex-wrap gap-2">
                    {(o.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-secondary/50 pr-2 rounded-lg overflow-hidden border border-transparent hover:border-border transition-colors">
                        <div className="w-8 h-8 flex-shrink-0 bg-muted">
                          {item.product.image ? (
                            <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-3 h-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold">
                          {item.quantity}x {item.product.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-bold">R$ {o.total.toFixed(2).replace('.', ',')}</TableCell>
                <TableCell>
                  <Badge className={`${statusColor[o.status] || ''} border-none font-bold`}>{o.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    {o.status === 'finalizado' && (
                      <button
                        onClick={() => archiveOrder(o.id)}
                        className="w-[130px] h-8 text-[10px] font-bold bg-secondary hover:bg-destructive hover:text-destructive-foreground transition-all rounded-md border"
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
