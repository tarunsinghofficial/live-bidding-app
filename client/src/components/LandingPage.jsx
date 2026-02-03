import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowRight,
  Gavel,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 pt-32 sm:px-6 lg:px-8"> {/* Added pt-32 to account for fixed navbar */}
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
            <Button size="lg" className="px-12 py-6 text-lg shadow-none bg-white/50 text-primary rounded-3xl hover:bg-white/70" asChild>
              <Link to="/register">
                Start Bidding
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="default" className="px-12 py-6 text-lg shadow-none bg-[#E2E687] text-primary rounded-3xl hover:bg-[#E2E687]/90" asChild>
              <Link to="/dashboard">Browse Auctions</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Why Choose LiveBid?</h2>
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
              Experience the future of online auctions with our cutting-edge platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Real-time Bidding */}
            <div className="p-8 transition-shadow border-0 shadow-lg bg-white/20 backdrop-blur-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-full bg-white/30 backdrop-blur">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Real-time Bidding</h3>
              <p className="text-muted-foreground">
                Experience live auctions with instant bid updates and synchronized countdowns across all devices.
              </p>
            </div>

            {/* Secure Platform */}
            <div className="p-8 transition-shadow border-0 shadow-lg bg-white/20 backdrop-blur-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-full bg-white/30 backdrop-blur">
                <Gavel className="w-6 h-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Secure & Trusted</h3>
              <p className="text-muted-foreground">
                Your transactions are protected with industry-leading security and transparent auction processes.
              </p>
            </div>

            {/* Smart Features */}
            <div className="p-8 transition-shadow border-0 shadow-lg bg-white/20 backdrop-blur-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-full bg-white/30 backdrop-blur">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Smart Features</h3>
              <p className="text-muted-foreground">
                Auto-extend auctions, reserve pricing, and intelligent bid management to ensure fair outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 overflow-hidden border-0 shadow-2xl bg-white/25 backdrop-blur-xl rounded-3xl">
            {/* Gradient overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#E2E687]/20 to-transparent opacity-50"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
                Ready to Start
                <span className="text-primary"> Bidding?</span>
              </h2>
              <p className="max-w-2xl mx-auto mb-8 text-xl text-muted-foreground">
                Join thousands of users discovering amazing items and winning incredible deals every day
              </p>
              <Button size="lg" className="px-12 py-4 text-lg shadow-none bg-[#E2E687] text-primary rounded-3xl hover:bg-[#E2E687]/90 hover:shadow-lg transition-all" asChild>
                <Link to="/register">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16 rounded-full bg-white/10 backdrop-blur"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 -translate-x-12 translate-y-12 rounded-full bg-white/10 backdrop-blur"></div>
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
