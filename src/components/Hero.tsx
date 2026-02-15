import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden brand-gradient py-16 md:py-24">
      {/* Decorative circles */}
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-primary-foreground/10" />
      <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 rounded-full bg-primary-foreground/10" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm font-bold text-primary-foreground">
            Tudo por apenas R$ 10!
          </span>
        </div>

        <h1 className="brand-font text-5xl md:text-7xl text-primary-foreground mb-4 drop-shadow-lg">
          Migles Make
        </h1>

        <p className="text-lg md:text-xl text-primary-foreground/90 max-w-md mx-auto mb-8 font-medium">
          Sua loja de beleza no centro de Guarulhos. Maquiagem, cosméticos e muito mais! ✨
        </p>

        <Link
          to="/produtos"
          className="inline-flex items-center gap-2 bg-primary-foreground text-primary font-bold rounded-full px-8 py-3 text-lg hover:scale-105 transition-transform shadow-lg"
        >
          Ver Produtos
        </Link>
      </div>
    </section>
  );
};

export default Hero;
