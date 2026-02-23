import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DBProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  active: boolean;
}

const categories = ['Maquiagem', 'Skincare', 'Acessórios', 'Cabelo', 'Unhas', 'Variedades'];

const emptyProduct: Omit<DBProduct, 'id'> = {
  name: '', price: 0, image_url: '', category: 'Maquiagem', stock: 0, active: true,
};

const AdminProducts = () => {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DBProduct | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('name');
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProduct);
    setImageFile(null);
    setImagePreview(null);
    setDialogOpen(true);
  };
  const openEdit = (p: DBProduct) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, image_url: p.image_url, category: p.category, stock: p.stock, active: p.active });
    setImageFile(null);
    setImagePreview(p.image_url);
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    let currentImageUrl = form.image_url;

    if (imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        currentImageUrl = publicUrl;
      } catch (error: unknown) {
        let message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado';

        if (message.includes('bucket_not_found') || message.includes('Bucket not found')) {
          message = 'Erro: O bucket "products" não foi criado no Supabase Storage. Crie o bucket com o nome "products" e marque-o como Público.';
        }

        toast({
          title: 'Erro no upload',
          description: message,
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
    }

    const finalForm = { ...form, image_url: currentImageUrl };

    if (editing) {
      const { error } = await supabase.from('products').update(finalForm).eq('id', editing.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); }
      else toast({ title: 'Produto atualizado!' });
    } else {
      const { error } = await supabase.from('products').insert(finalForm);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); }
      else toast({ title: 'Produto criado!' });
    }
    setLoading(false);
    setDialogOpen(false);
    setImageFile(null);
    setImagePreview(null);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir produto?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast({ title: 'Produto excluído.' });
    fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Novo Produto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Preço (R$)</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="grid gap-2">
                  <Label>Estoque</Label>
                  <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Imagem do Produto</Label>
                <div className="flex flex-col gap-4">
                  {imagePreview ? (
                    <div className="relative aspect-square w-32 overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-1 right-1 h-6 w-6"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex aspect-square w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted hover:bg-muted/80"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase font-bold text-center px-1">Upload</span>
                    </div>
                  )}
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Ou URL manual</Label>
                    <Input
                      placeholder="https://..."
                      value={form.image_url}
                      onChange={e => {
                        setForm({ ...form, image_url: e.target.value });
                        if (!imageFile) setImagePreview(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} />
                <Label>Ativo</Label>
              </div>
              <Button onClick={handleSave} disabled={loading || !form.name}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum produto cadastrado.</TableCell></TableRow>
            ) : products.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="w-12 h-12 rounded-lg overflow-hidden border bg-muted">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>R$ {p.price.toFixed(2)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {p.active ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default AdminProducts;
