import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant, useMenus, useCreateMenu, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from '@/hooks/useRestaurant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, UtensilsCrossed } from 'lucide-react';

export default function MenuManagement() {
  const { user, loading: authLoading } = useAuth();
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant();
  const { data: menus, isLoading: menusLoading } = useMenus(restaurant?.id);
  const createMenu = useCreateMenu();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [newMenuName, setNewMenuName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreateMenu = async () => {
    if (!restaurant || !newMenuName.trim()) return;
    
    try {
      await createMenu.mutateAsync({
        restaurantId: restaurant.id,
        name: newMenuName.trim(),
      });
      toast({ title: 'Menu created!' });
      setNewMenuName('');
      setMenuDialogOpen(false);
    } catch {
      toast({ title: 'Failed to create menu', variant: 'destructive' });
    }
  };

  const handleCreateItem = async () => {
    if (!selectedMenuId || !newItemName.trim() || !newItemPrice) return;
    
    try {
      await createMenuItem.mutateAsync({
        menuId: selectedMenuId,
        name: newItemName.trim(),
        price: parseFloat(newItemPrice),
      });
      toast({ title: 'Item added!' });
      setNewItemName('');
      setNewItemPrice('');
      setItemDialogOpen(false);
    } catch {
      toast({ title: 'Failed to add item', variant: 'destructive' });
    }
  };

  const handleToggleAvailability = async (itemId: string, currentAvailability: boolean) => {
    try {
      await updateMenuItem.mutateAsync({
        id: itemId,
        is_available: !currentAvailability,
      });
    } catch {
      toast({ title: 'Failed to update item', variant: 'destructive' });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteMenuItem.mutateAsync(itemId);
      toast({ title: 'Item deleted' });
    } catch {
      toast({ title: 'Failed to delete item', variant: 'destructive' });
    }
  };

  if (authLoading || restaurantLoading || menusLoading) {
    return (
      <div className="min-h-screen gradient-hero p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-48 mb-4" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold">Menu Management</h1>
            <p className="text-sm text-muted-foreground">{restaurant?.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Your Menus</h2>
          <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Menu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Menu</DialogTitle>
                <DialogDescription>Add a new menu to your restaurant</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="menuName">Menu Name</Label>
                  <Input
                    id="menuName"
                    placeholder="e.g., Lunch Menu, Dinner Specials"
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateMenu} disabled={!newMenuName.trim() || createMenu.isPending} className="w-full">
                  {createMenu.isPending ? 'Creating...' : 'Create Menu'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {menus && menus.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No menus yet</h3>
              <p className="text-muted-foreground mb-4">Create your first menu to start adding items</p>
              <Button onClick={() => setMenuDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Menu
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {menus?.map((menu) => (
            <Card key={menu.id} className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {menu.name}
                      {menu.is_active && <Badge variant="success">Active</Badge>}
                    </CardTitle>
                    <CardDescription>
                      {menu.menu_items?.length || 0} items
                    </CardDescription>
                  </div>
                  <Dialog open={itemDialogOpen && selectedMenuId === menu.id} onOpenChange={(open) => {
                    setItemDialogOpen(open);
                    if (open) setSelectedMenuId(menu.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Menu Item</DialogTitle>
                        <DialogDescription>Add a new item to {menu.name}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="itemName">Item Name</Label>
                          <Input
                            id="itemName"
                            placeholder="e.g., Margherita Pizza"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="itemPrice">Price ($)</Label>
                          <Input
                            id="itemPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="12.99"
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={handleCreateItem} 
                          disabled={!newItemName.trim() || !newItemPrice || createMenuItem.isPending}
                          className="w-full"
                        >
                          {createMenuItem.isPending ? 'Adding...' : 'Add Item'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {menu.menu_items && menu.menu_items.length > 0 ? (
                  <div className="divide-y">
                    {menu.menu_items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">${Number(item.price).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.is_available}
                              onCheckedChange={() => handleToggleAvailability(item.id, item.is_available)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {item.is_available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No items in this menu yet</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
