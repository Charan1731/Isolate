import React from 'react'
import { ArrowRight, Shield, Users, FileText, Building, CheckCircle, Star } from 'lucide-react'

const page = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-muted/50 border border-border/50 rounded-full text-sm text-muted-foreground">
              <Building className="w-4 h-4 mr-2" />
              A modern multi-tenant note management system
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground">
                Secure
              </span>
              <br />
              <span className="text-primary">Collaboration</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Help teams and organizations capture, manage, and collaborate on notes 
              with strict data isolation and enterprise-grade security.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button className="group bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 flex items-center">
                Start for Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-border px-8 py-4 rounded-xl font-medium hover:bg-muted/50 transition-colors">
                View Demo
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
              Everything Your Team Needs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for enterprises and multi-team environments with strong tenant isolation and role-based security
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-card border border-border/50 rounded-2xl hover:border-border transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Tenant Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                Each organization gets its own secure workspace with JWT authentication and role-based access control.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-card border border-border/50 rounded-2xl hover:border-border transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Notes Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create, edit, version, and soft-delete notes with powerful search, filters, and CSV import/export.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-card border border-border/50 rounded-2xl hover:border-border transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Invite team members via email with expiring tokens and track all actions with comprehensive audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Register Your Tenant</h3>
              <p className="text-muted-foreground">
                Create your organization&apos;s secure workspace with isolated data and custom branding.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Invite Your Team</h3>
              <p className="text-muted-foreground">
                Send secure email invitations to team members with role-based permissions and access controls.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Start Collaborating</h3>
              <p className="text-muted-foreground">
                Create, share, and manage notes with your team while maintaining complete data isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose the plan that fits your team&apos;s needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="p-8 bg-card border border-border/50 rounded-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">FREE</h3>
                <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">Perfect for small teams getting started</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>Up to 5 team members</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>100 notes per month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>Basic collaboration tools</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>Email support</span>
                </li>
              </ul>
              <button className="w-full border border-border px-6 py-3 rounded-xl font-medium hover:bg-muted/50 transition-colors">
                Get Started Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-8 bg-card border border-primary/50 rounded-2xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">PRO</h3>
                <div className="text-4xl font-bold mb-4">$29<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">For growing teams and organizations</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>Unlimited team members</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>Unlimited notes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>Advanced audit logs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>CSV import/export</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                Start Pro Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Teams Worldwide
            </h2>
            <p className="text-muted-foreground text-lg">
              See how organizations use Isolate to secure their collaboration
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-card border border-border/50 rounded-2xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                &quot;Isolate has transformed how our team collaborates on sensitive projects. The multi-tenant architecture gives us complete confidence in data isolation.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="font-semibold text-primary">A</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-sm text-muted-foreground">CTO, Acme Corp</div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-card border border-border/50 rounded-2xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                &quot;The audit logs and role-based permissions are exactly what we needed for compliance. Isolate makes enterprise collaboration simple and secure.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="font-semibold text-primary">G</span>
                </div>
                <div>
                  <div className="font-semibold">Michael Chen</div>
                  <div className="text-sm text-muted-foreground">Head of Security, Globex Inc</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-card border border-border/50 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Your Team on Isolate Today
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Start collaborating securely with your team. Set up your tenant in minutes and invite your first team members.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group bg-primary text-primary-foreground px-10 py-4 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 flex items-center mx-auto sm:mx-0">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-border px-10 py-4 rounded-xl font-medium hover:bg-muted/50 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default page