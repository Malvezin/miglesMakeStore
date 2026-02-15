import { Product } from '@/contexts/CartContext';

export const STORE_CITY = 'Guarulhos';

export const categories = [
  'Todos',
  'Maquiagem',
  'Skincare',
  'Acessórios',
  'Cabelo',
  'Unhas',
  'Variedades',
];

export const products: Product[] = [
  { id: '1', name: 'Batom Matte Rosê', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop', category: 'Maquiagem' },
  { id: '2', name: 'Base Líquida Natural', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', category: 'Maquiagem' },
  { id: '3', name: 'Paleta de Sombras', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop', category: 'Maquiagem' },
  { id: '4', name: 'Rímel Volume Extra', image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&h=400&fit=crop', category: 'Maquiagem' },
  { id: '5', name: 'Hidratante Facial', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', category: 'Skincare' },
  { id: '6', name: 'Protetor Solar FPS 50', image: 'https://images.unsplash.com/photo-1556228720-195a672e68a0?w=400&h=400&fit=crop', category: 'Skincare' },
  { id: '7', name: 'Água Micelar', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop', category: 'Skincare' },
  { id: '8', name: 'Brincos Dourados', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', category: 'Acessórios' },
  { id: '9', name: 'Pulseira Boho', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', category: 'Acessórios' },
  { id: '10', name: 'Máscara Capilar', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop', category: 'Cabelo' },
  { id: '11', name: 'Óleo de Argan', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop', category: 'Cabelo' },
  { id: '12', name: 'Kit Esmaltes Neon', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop', category: 'Unhas' },
  { id: '13', name: 'Película de Unha', image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop', category: 'Unhas' },
  { id: '14', name: 'Fone Bluetooth Rosa', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop', category: 'Variedades' },
  { id: '15', name: 'Necessaire Estampada', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', category: 'Variedades' },
  { id: '16', name: 'Espelho de Bolsa LED', image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop', category: 'Variedades' },
];
