import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useRestaurant() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['restaurant', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useRestaurantBySlug(slug: string) {
  return useQuery({
    queryKey: ['restaurant-public', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useMenus(restaurantId?: string) {
  return useQuery({
    queryKey: ['menus', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data, error } = await supabase
        .from('menus')
        .select('*, menu_items(*)')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });
}

export function usePublicMenus(restaurantId?: string) {
  return useQuery({
    queryKey: ['public-menus', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data, error } = await supabase
        .from('menus')
        .select('*, menu_items(*)')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restaurantId, name }: { restaurantId: string; name: string }) => {
      const { data, error } = await supabase
        .from('menus')
        .insert({ restaurant_id: restaurantId, name })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menus', variables.restaurantId] });
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuId, name, price }: { menuId: string; name: string; price: number }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({ menu_id: menuId, name, price })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; price?: number; is_available?: boolean }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}
