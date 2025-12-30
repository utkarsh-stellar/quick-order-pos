import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, RefreshCw, Clock, CheckCircle, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function POS() {
  const { user, loading: authLoading } = useAuth();
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant();
  const { data: orders, isLoading: ordersLoading, refetch } = useOrders(restaurant?.id);
  const updateOrderStatus = useUpdateOrderStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
      toast({ title: `Order ${newStatus}` });
    } catch {
      toast({ title: 'Failed to update order', variant: 'destructive' });
    }
  };

  if (authLoading || restaurantLoading || ordersLoading) {
    return (
      <div className="min-h-screen gradient-hero p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  const newOrders = orders?.filter((o) => o.status === 'new') || [];
  const acceptedOrders = orders?.filter((o) => o.status === 'accepted') || [];
  const completedOrders = orders?.filter((o) => o.status === 'completed').slice(0, 10) || [];

  const OrderCard = ({ order, showAcceptButton, showCompleteButton }: { 
    order: typeof orders extends (infer T)[] | undefined ? T : never;
    showAcceptButton?: boolean;
    showCompleteButton?: boolean;
  }) => (
    <Card className="animate-scale-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono">
            #{order.id.slice(0, 8).toUpperCase()}
          </CardTitle>
          <Badge variant={order.status as 'new' | 'accepted' | 'completed'}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.menu_items?.name || 'Unknown item'}
              </span>
              <span className="text-muted-foreground">
                ${((item.menu_items?.price || 0) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 border-t">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold">${Number(order.total).toFixed(2)}</span>
        </div>
        {showAcceptButton && (
          <Button
            variant="pos-warning"
            className="w-full mt-4"
            onClick={() => handleStatusChange(order.id, 'accepted')}
            disabled={updateOrderStatus.isPending}
          >
            Accept Order
          </Button>
        )}
        {showCompleteButton && (
          <Button
            variant="pos-success"
            className="w-full mt-4"
            onClick={() => handleStatusChange(order.id, 'completed')}
            disabled={updateOrderStatus.isPending}
          >
            Mark Complete
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-secondary/50">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold">POS Dashboard</h1>
              <p className="text-sm text-muted-foreground">{restaurant?.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* New Orders */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">New Orders</h2>
              {newOrders.length > 0 && (
                <Badge variant="new">{newOrders.length}</Badge>
              )}
            </div>
            <div className="space-y-4">
              {newOrders.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">No new orders</p>
                  </CardContent>
                </Card>
              ) : (
                newOrders.map((order) => (
                  <OrderCard key={order.id} order={order} showAcceptButton />
                ))
              )}
            </div>
          </div>

          {/* Accepted Orders */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-warning" />
              </div>
              <h2 className="text-lg font-semibold">In Progress</h2>
              {acceptedOrders.length > 0 && (
                <Badge variant="accepted">{acceptedOrders.length}</Badge>
              )}
            </div>
            <div className="space-y-4">
              {acceptedOrders.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">No orders in progress</p>
                  </CardContent>
                </Card>
              ) : (
                acceptedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} showCompleteButton />
                ))
              )}
            </div>
          </div>

          {/* Completed Orders */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <h2 className="text-lg font-semibold">Completed</h2>
              {completedOrders.length > 0 && (
                <Badge variant="completed">{completedOrders.length}</Badge>
              )}
            </div>
            <div className="space-y-4">
              {completedOrders.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">No completed orders</p>
                  </CardContent>
                </Card>
              ) : (
                completedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
