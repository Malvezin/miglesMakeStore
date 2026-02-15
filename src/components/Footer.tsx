import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="brand-font text-xl text-primary mb-2">Migles Make</p>
        <p className="text-sm text-muted-foreground mb-1">
          Centro de Guarulhos — Tudo por R$ 10!
        </p>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          Feito com <Heart className="w-3 h-3 text-primary fill-primary" /> para você
        </p>
      </div>
    </footer>
  );
};

export default Footer;
