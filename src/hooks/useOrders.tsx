import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useOrders(restaurantId?: string) {
  return useQuery({
    queryKey: ['orders', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            menu_items(name, price)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async ({ 
      restaurantId, 
      items 
    }: { 
      restaurantId: string; 
      items: { menuItemId: string; quantity: number; price: number }[] 
    }) => {
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ 
          restaurant_id: restaurantId, 
          total,
          status: 'new'
        })
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;

      return order;
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
