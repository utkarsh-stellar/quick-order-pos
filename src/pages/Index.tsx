import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, CreditCard, Smartphone, BarChart3, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: UtensilsCrossed,
    title: 'Menu Management',
    description: 'Create and manage your menus with ease. Update prices, availability, and items in seconds.',
  },
  {
    icon: Smartphone,
    title: 'Online Ordering',
    description: 'Give customers a beautiful ordering page. They order, you get notified instantly.',
  },
  {
    icon: BarChart3,
    title: 'POS Dashboard',
    description: 'View and manage all orders from one tablet-friendly dashboard. Accept, complete, track.',
  },
  {
    icon: CreditCard,
    title: 'Zero Commission',
    description: 'Keep 100% of your revenue. Pay a simple flat monthly fee, no per-order charges.',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="gradient-hero">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">
            Orderly<span className="text-primary">.</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
              Restaurant ordering,{' '}
              <span className="text-primary">simplified</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A complete online ordering and POS solution for restaurants. 
              Zero commissions. Beautiful experience. Happy customers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="xl" className="shadow-glow">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="xl" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-24 bg-card">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything you need to succeed
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From menu management to order fulfillment, we've got you covered.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="text-center group hover:shadow-lg transition-shadow animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-8 pb-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 gradient-hero">
        <div className="max-w-4xl mx-auto px-6 text-center animate-fade-in">
          <h3 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to transform your restaurant?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of restaurants already using Orderly to streamline their operations.
          </p>
          <Link to="/auth">
            <Button size="xl" className="shadow-glow">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-xl font-display font-bold">
              Orderly<span className="text-primary">.</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              © 2024 Orderly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
