import React from 'react'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'

const page = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-muted/50 border border-border/50 rounded-full text-sm text-muted-foreground">
              <Zap className="w-4 h-4 mr-2" />
              Introducing the future of isolation
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground">
                Secure by
              </span>
              <br />
              <span className="text-primary">Design</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience next-generation isolation technology that keeps your data secure 
              while maintaining seamless performance and user experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button className="group bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 flex items-center">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-border px-8 py-4 rounded-xl font-medium hover:bg-muted/50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for the Future
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Advanced isolation capabilities designed to protect what matters most
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-card border border-border/50 rounded-2xl hover:border-border transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                Military-grade encryption and isolation protocols ensure your data remains completely secure and private.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-card border border-border/50 rounded-2xl hover:border-border transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                Optimized performance ensures zero compromise between security and speed in your workflow.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-card border border-border/50 rounded-2xl hover:border-border transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Scale</h3>
              <p className="text-muted-foreground leading-relaxed">
                Deploy anywhere with confidence. Our infrastructure scales globally while maintaining isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-card border border-border/50 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience True Isolation?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of organizations that trust Isolate to keep their most sensitive data secure.
            </p>
            <button className="group bg-primary text-primary-foreground px-10 py-4 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 flex items-center mx-auto">
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default page