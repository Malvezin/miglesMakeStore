import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Settings, Search, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  full_name: string;
  email: string | null;
  role: 'admin' | 'user';
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [configUser, setConfigUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email');

    if (!profiles) { setLoading(false); return; }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('role', 'admin');

    const adminSet = new Set((roles || []).map(r => r.user_id));

    const merged: UserProfile[] = profiles.map(p => ({
      id: p.id,
      full_name: p.full_name || 'Sem nome',
      email: p.email,
      role: adminSet.has(p.id) ? 'admin' : 'user',
    }));

    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      (u.email?.toLowerCase().includes(q) ?? false)
    );
  });

  const openConfig = (user: UserProfile) => {
    setConfigUser(user);
    setSelectedRole(user.role);
  };

  const saveRole = async () => {
    if (!configUser) return;
    setSaving(true);

    try {
      if (selectedRole === 'admin' && configUser.role !== 'admin') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: configUser.id, role: 'admin' });
        if (error) throw error;
      } else if (selectedRole === 'user' && configUser.role === 'admin') {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', configUser.id)
          .eq('role', 'admin');
        if (error) throw error;
      }

      toast({ title: 'Role atualizada com sucesso!' });
      setConfigUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }

    setSaving(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell>
                  <div>
                    <span className="font-medium">{u.full_name}</span>
                    <span className="block sm:hidden text-xs text-muted-foreground">{u.email}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{u.email || '—'}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.role === 'admin'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {u.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {u.role === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openConfig(u)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!configUser} onOpenChange={open => !open && setConfigUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Usuário</DialogTitle>
            <DialogDescription>
              Altere a role de {configUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <Label className="text-muted-foreground text-xs">Nome</Label>
              <p className="font-medium">{configUser?.full_name}</p>
            </div>
            {configUser?.email && (
              <div className="grid gap-1">
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="text-sm">{configUser.email}</p>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={v => setSelectedRole(v as 'admin' | 'user')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveRole} disabled={saving || selectedRole === configUser?.role}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
