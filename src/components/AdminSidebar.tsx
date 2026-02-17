import { LayoutDashboard, Package, ShoppingCart, Users, ArrowLeft } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Produtos', url: '/admin/produtos', icon: Package },
  { title: 'Pedidos', url: '/admin/pedidos', icon: ShoppingCart },
  { title: 'Administradores', url: '/admin/usuarios', icon: Users },
];

export function AdminSidebar() {
  return (
    <Sidebar className="w-60 border-r">
      <SidebarContent>
        <div className="p-4 flex items-center justify-between">
          <span className="brand-font text-xl text-primary">Admin</span>
          <SidebarTrigger />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à loja
          </Link>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
