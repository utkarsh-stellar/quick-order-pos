import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UtensilsCrossed, ClipboardList, CreditCard, LogOut, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || restaurantLoading) {
    return (
      <div className="min-h-screen gradient-hero p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No restaurant found. Please contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customerUrl = `/r/${restaurant.slug}`;

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-bold">
              Orderly<span className="text-primary">.</span>
            </h1>
            <Badge variant={restaurant.plan as 'starter' | 'growth' | 'pro'}>
              {restaurant.plan.charAt(0).toUpperCase() + restaurant.plan.slice(1)} Plan
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-display font-bold text-foreground">
            {restaurant.name}
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your restaurant from one place
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/menu')}>
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>Create and manage your menus and items</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Manage Menu
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pos')}>
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                <ClipboardList className="h-6 w-6 text-success" />
              </div>
              <CardTitle>POS Dashboard</CardTitle>
              <CardDescription>View and manage incoming orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Open POS
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pricing')}>
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                <CreditCard className="h-6 w-6 text-warning" />
              </div>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>View plans and upgrade</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                View Plans
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-lg">Customer Ordering Page</CardTitle>
            <CardDescription>Share this link with your customers to place orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono">
                {window.location.origin}{customerUrl}
              </code>
              <Link to={customerUrl} target="_blank">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
