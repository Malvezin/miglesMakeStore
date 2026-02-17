import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminRole {
  id: string;
  user_id: string;
  role: string;
}

const AdminUsers = () => {
  const [admins, setAdmins] = useState<AdminRole[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAdmins = async () => {
    const { data } = await supabase.from('user_roles').select('*').eq('role', 'admin');
    if (data) setAdmins(data);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const addAdmin = async () => {
    if (!userId.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('user_roles').insert({ user_id: userId.trim(), role: 'admin' });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Admin adicionado!' }); setUserId(''); setDialogOpen(false); fetchAdmins(); }
    setLoading(false);
  };

  const removeAdmin = async (id: string) => {
    if (!confirm('Remover este administrador?')) return;
    await supabase.from('user_roles').delete().eq('id', id);
    toast({ title: 'Admin removido.' });
    fetchAdmins();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Administradores</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Adicionar Admin</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Administrador</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>ID do Usuário (UUID)</Label>
                <Input placeholder="cole o UUID do usuário aqui" value={userId} onChange={e => setUserId(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  Encontre o UUID do usuário na tabela auth.users do seu dashboard Supabase.
                </p>
              </div>
              <Button onClick={addAdmin} disabled={loading || !userId.trim()}>
                {loading ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhum admin cadastrado.</TableCell></TableRow>
            ) : admins.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs">{a.user_id}</TableCell>
                <TableCell>{a.role}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => removeAdmin(a.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
