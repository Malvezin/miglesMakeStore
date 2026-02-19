import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { setDisplayName(null); return; }
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        setDisplayName(data?.full_name || user.email?.split('@')[0] || null);
      });
  }, [user]);

  const links = [
    { to: '/', label: 'Início' },
    { to: '/produtos', label: 'Produtos' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="brand-font text-2xl text-primary tracking-wide">
          Migles Make
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-semibold transition-colors hover:text-primary ${
                location.pathname === link.to ? 'text-primary' : 'text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin" className="p-2 rounded-full hover:bg-secondary transition-colors" title="Painel Admin">
                  <Shield className="w-4 h-4 text-primary" />
                </Link>
              )}
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {displayName}
              </span>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4 text-foreground" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex p-2 rounded-full hover:bg-secondary transition-colors"
              title="Entrar"
            >
              <User className="w-5 h-5 text-foreground" />
            </Link>
          )}

          <Link to="/carrinho" className="relative p-2 rounded-full hover:bg-secondary transition-colors">
            <ShoppingBag className="w-5 h-5 text-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-card border-b animate-in slide-in-from-top-2">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-semibold py-2 transition-colors hover:text-primary ${
                  location.pathname === link.to ? 'text-primary' : 'text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-semibold py-2 text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Painel Admin
              </Link>
            )}
            {user ? (
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false); }}
                className="text-sm font-semibold py-2 text-left text-foreground hover:text-primary transition-colors"
              >
                Sair ({displayName})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-semibold py-2 text-foreground hover:text-primary transition-colors"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
