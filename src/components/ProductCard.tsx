"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0 relative">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-destructive">
                {discount}% OFF
              </Badge>
            )}
            {product.featured && (
              <Badge className="absolute top-2 right-2 bg-primary">
                Featured
              </Badge>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <Button size="icon" variant="secondary" onClick={handleQuickAdd}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
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
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((color) => (
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
