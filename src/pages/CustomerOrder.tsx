import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurantBySlug, usePublicMenus } from '@/hooks/useRestaurant';
import { useCreateOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, CheckCircle, UtensilsCrossed } from 'lucide-react';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CustomerOrder() {
  const { slug } = useParams<{ slug: string }>();
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurantBySlug(slug || '');
  const { data: menus, isLoading: menusLoading } = usePublicMenus(restaurant?.id);
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const addToCart = (menuItemId: string, name: string, price: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItemId);
      if (existing) {
        return prev.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItemId, name, price, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!restaurant || cart.length === 0) return;

    try {
      await createOrder.mutateAsync({
        restaurantId: restaurant.id,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
      });
      setOrderPlaced(true);
      setCart([]);
    } catch {
      toast({
        title: 'Failed to place order',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (restaurantLoading || menusLoading) {
    return (
      <div className="min-h-screen gradient-hero p-6">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-48 mb-4" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Restaurant not found</h2>
            <p className="text-muted-foreground">This restaurant doesn't exist or is no longer available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center animate-scale-in">
          <CardContent className="pt-8 pb-8">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Order Placed!</h2>
            <p className="text-muted-foreground mb-6">
              Your order has been sent to the kitchen. Please pay at the counter.
            </p>
            <Button onClick={() => setOrderPlaced(false)} variant="outline">
              Place Another Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero pb-32">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-display font-bold">{restaurant.name}</h1>
          <p className="text-sm text-muted-foreground">Order for pickup</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        {menus && menus.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No menu available</h3>
              <p className="text-muted-foreground">This restaurant hasn't set up their menu yet.</p>
            </CardContent>
          </Card>
        )}

        {menus?.map((menu) => (
          <div key={menu.id} className="mb-8 animate-fade-in">
            <h2 className="text-xl font-display font-semibold mb-4">{menu.name}</h2>
            <div className="space-y-3">
              {menu.menu_items?.filter(item => item.is_available).map((item) => {
                const cartItem = cart.find((c) => c.menuItemId === item.id);
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-primary font-semibold">${Number(item.price).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {cartItem ? (
                          <div className="flex items-center gap-3 bg-secondary rounded-full p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-semibold min-w-[1.5rem] text-center">
                              {cartItem.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToCart(item.id, item.name, Number(item.price))}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg animate-slide-up">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span className="font-medium">{cartItemCount} items</span>
              </div>
              <span className="text-xl font-bold">${cartTotal.toFixed(2)}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? 'Placing Order...' : 'Place Order (Pay at Counter)'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
