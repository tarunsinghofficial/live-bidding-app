import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Gavel, 
  ArrowRight,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Gavel className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">LiveBid</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="px-6 py-2 shadow-none bg-white/50 text-foreground rounded-3xl hover:bg-white/70">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="px-6 py-2 shadow-none bg-primary text-primary-foreground rounded-3xl hover:bg-primary/90">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto text-center max-w-7xl">
          <Badge className="mb-4" variant="secondary">
            <Zap className="w-3 h-3 mr-1" />
            Real-time Bidding Platform
          </Badge>
          <h1 className="mb-6 text-4xl font-bold sm:text-6xl text-foreground">
            Bid on Amazing Items
            <span className="text-primary"> Live</span>
          </h1>
          <p className="max-w-2xl mx-auto mb-8 text-xl text-muted-foreground">
            Experience the thrill of live auctions. Bid on unique items, compete with other bidders, and win amazing deals in real-time.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="px-12 py-6 text-lg shadow-none bg-white/50 text-foreground rounded-3xl hover:bg-white/70" asChild>
              <Link to="/register">
                Start Bidding
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="default" className="px-12 py-6 text-lg shadow-none bg-primary text-primary-foreground rounded-3xl hover:bg-primary/90" asChild>
              <Link to="/dashboard">Browse Auctions</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="pt-8 mt-8 text-center text-muted-foreground">
            <p>Made with ❤️ by Tarun &copy; 2026 LiveBid.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
