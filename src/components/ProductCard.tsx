"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { ensureArray } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const images = ensureArray<string>(product.images);
  const colors = ensureArray<string>(product.colors);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.inStock) {
      addToCart(product);
    }
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0 relative">
          <div className="relative aspect-square overflow-hidden bg-muted">
              <Image
                src={images[0] || '/placeholder.png'}
                alt={product.name}
                fill
                className={`object-cover group-hover:scale-110 transition-transform duration-300 ${!product.inStock ? 'opacity-50' : ''}`}
                unoptimized
              />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge className="bg-destructive text-white text-lg px-4 py-2">
                  OUT OF STOCK
                </Badge>
              </div>
            )}
            {discount > 0 && product.inStock && (
              <Badge className="absolute top-2 left-2 bg-destructive">
                {discount}% OFF
              </Badge>
            )}
            {product.featured && product.inStock && (
              <Badge className="absolute top-2 right-2 bg-primary">
                Featured
              </Badge>
            )}
            {product.inStock && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" onClick={handleQuickAdd}>
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start p-4 gap-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
            {colors.length > 0 && (
              <div className="flex gap-1">
                {colors.slice(0, 3).map((color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ 
                    backgroundColor: color.toLowerCase() === 'multicolor' 
                      ? 'linear-gradient(to right, red, yellow, green, blue)' 
                      : color.toLowerCase() 
                  }}
                  title={color}
                />
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
