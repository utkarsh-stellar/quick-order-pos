import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    slug: 'starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small restaurants just getting started',
    features: [
      'Up to 50 orders/month',
      '1 menu',
      'Basic POS dashboard',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    slug: 'growth',
    price: '$79',
    period: '/month',
    description: 'For growing restaurants with higher volume',
    popular: true,
    features: [
      'Unlimited orders',
      'Multiple menus',
      'Advanced POS features',
      'Priority support',
      'Analytics dashboard',
      'Custom branding',
    ],
  },
  {
    name: 'Pro',
    slug: 'pro',
    price: '$149',
    period: '/month',
    description: 'For established restaurants with premium needs',
    features: [
      'Everything in Growth',
      'Multi-location support',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'White-label option',
    ],
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const { data: restaurant } = useRestaurant();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpgrade = (planSlug: string) => {
    toast({
      title: 'Upgrade requested!',
      description: `You selected the ${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} plan. This is a demo - no payment required.`,
    });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          {user && (
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-display font-bold">
              Orderly<span className="text-primary">.</span> Pricing
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-display font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Zero commissions. Just a flat monthly fee. Choose the plan that fits your restaurant.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 animate-slide-up">
          {plans.map((plan) => {
            const isCurrentPlan = restaurant?.plan === plan.slug;
            return (
              <Card
                key={plan.slug}
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-4">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-display">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-success" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'secondary' : plan.popular ? 'default' : 'outline'}
                    onClick={() => !isCurrentPlan && handleUpgrade(plan.slug)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-8">
              <h3 className="text-xl font-display font-semibold mb-2">
                Have questions about our plans?
              </h3>
              <p className="text-muted-foreground mb-4">
                Our team is here to help you choose the right plan for your restaurant.
              </p>
              <Button variant="outline" onClick={() => toast({ title: 'Demo mode', description: 'Contact form would be here!' })}>
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
