"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Heart,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Plus,
  Minus,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ProductCard from '@/components/ProductCard';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ensureArray } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  category: string;
  images: string[];
  colors: string[] | null;
  sizes: string[] | null;
  inStock: boolean;
  featured: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1.2);

  const images = product ? ensureArray<string>(product.images) : [];
  const colors = product ? ensureArray<string>(product.colors) : [];
  const sizes = product ? ensureArray<string>(product.sizes) : [];

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?id=${productId}`);
        if (!res.ok) {
          setProduct(null);
          return;
        }
        const data = await res.json();
        setProduct(data);

        // Fetch related products
        if (data.category) {
          const relatedRes = await fetch(`/api/products?category=${data.category}&limit=5`);
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedProducts(relatedData.filter((p: Product) => p.id !== data.id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    addToCart(product, quantity, selectedColor, selectedSize);
    toast.success('Added to cart!', {
      description: `${product.name} has been added to your cart`,
    });
  };

  const openZoom = (index: number) => {
    setSelectedImage(index);
    setZoomImageIndex(index);
    setZoomScale(1.2);
    setIsZoomOpen(true);
  };

  const handleZoomAdjust = (delta: number) => {
    setZoomScale((prev) => {
      const next = Math.min(3, Math.max(1, Number((prev + delta).toFixed(2))));
      return next;
    });
  };

  const handleZoomNavigate = (direction: 'prev' | 'next') => {
    setZoomImageIndex((current) => {
      const nextIndex = direction === 'prev'
        ? (current - 1 + images.length) % images.length
        : (current + 1) % images.length;
      setSelectedImage(nextIndex);
      return nextIndex;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-foreground capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Image Gallery */}
        <div>
          <Card className="overflow-hidden mb-4">
            <div
              className="relative aspect-square bg-muted group cursor-zoom-in"
              role="button"
              tabIndex={0}
              onClick={() => openZoom(selectedImage)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openZoom(selectedImage);
                }
              }}
            >
              <Image
                src={images[selectedImage] || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                priority
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive">
                  {discount}% OFF
                </Badge>
              )}
              <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white shadow-md">
                <Maximize2 className="h-3 w-3" />
                Click to zoom
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                onDoubleClick={() => openZoom(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} - ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="capitalize">{product.category}</Badge>
            {product.featured && <Badge>Featured</Badge>}
            {product.inStock ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Check className="h-3 w-3 mr-1" />
                In Stock
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold">₹{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
                <span className="text-green-600 font-semibold">
                  Save ₹{product.originalPrice - product.price}
                </span>
              </>
            )}
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="mb-6">
              <Label className="text-base mb-3 block">
                Color {selectedColor && `- ${selectedColor}`}
              </Label>
              <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <div key={color}>
                      <RadioGroupItem
                        value={color}
                        id={`color-${color}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`color-${color}`}
                        className="flex items-center justify-center px-4 py-2 rounded-md border-2 border-muted cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:border-primary/50"
                      >
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}



          {/* Quantity */}
          <div className="mb-6">
            <Label className="text-base mb-3 block">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-semibold">Free Shipping</p>
                <p className="text-muted-foreground">On orders above ₹999</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">7 Day Return</p>
                <p className="text-muted-foreground">Easy return & exchange policy</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="font-semibold">Secure Payment</p>
                <p className="text-muted-foreground">100% secure payment methods</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Dialog */}
      <Dialog open={isZoomOpen} onOpenChange={(open) => {
        setIsZoomOpen(open);
        if (!open) setZoomScale(1.2);
      }}>
        <DialogContent className="max-w-5xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>Use buttons or scroll to zoom</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => handleZoomAdjust(-0.25)}
                  disabled={zoomScale <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-14 text-center font-medium text-foreground">{Math.round(zoomScale * 100)}%</span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => handleZoomAdjust(0.25)}
                  disabled={zoomScale >= 3}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted"
              onWheel={(e) => {
                e.preventDefault();
                handleZoomAdjust(e.deltaY < 0 ? 0.1 : -0.1);
              }}
            >
              <Image
                src={images[zoomImageIndex] || '/placeholder.png'}
                alt={`${product.name} zoomed view`}
                fill
                className="object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoomScale})` }}
                sizes="(min-width: 1024px) 800px, 100vw"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleZoomNavigate('prev')}
                disabled={images.length <= 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => openZoom(index)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition ${
                      zoomImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleZoomNavigate('next')}
                disabled={images.length <= 1}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
