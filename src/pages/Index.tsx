import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Bell, AlertCircle } from "lucide-react";
import { LookupForm } from "@/components/LookupForm";
import { SubscribeForm } from "@/components/SubscribeForm";
import { LegislatorList } from "@/components/LegislatorList";

const Index = () => {
  const [selectedDistricts, setSelectedDistricts] = useState<{chamber: string, district: string}[]>([]);
  const [showSubscribe, setShowSubscribe] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="h-5 w-5 text-xl flex items-center justify-center">🚨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Capitol Crier</h1>
              <p className="text-sm text-muted-foreground">Free alerts when your legislators vote</p>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-accent/30 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-accent-foreground" />
            <span>This tool is for Wyoming residents only (for now). Please consider donating so we can expand.</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Lookup Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Find Your Legislators
                </CardTitle>
                <CardDescription>
                  Enter your Wyoming address or ZIP code to find your House and Senate representatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LookupForm 
                  onDistrictsFound={(districts) => {
                    setSelectedDistricts(districts);
                    setShowSubscribe(true);
                  }}
                />
              </CardContent>
            </Card>

          </div>

          {/* Subscribe Section */}
          <div className="space-y-6">
            {showSubscribe ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Get Vote Alerts
                  </CardTitle>
                  <CardDescription>
                    Subscribe to receive SMS and/or email alerts when your legislators vote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscribeForm selectedDistricts={selectedDistricts} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    View All Legislators
                  </CardTitle>
                  <CardDescription>
                    Browse the complete list of Wyoming House and Senate members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LegislatorList />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* How it works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">1. Find Your Legislators</h3>
              <p className="text-sm text-muted-foreground">Enter your address to discover your House and Senate representatives</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">2. Subscribe to Alerts</h3>
              <p className="text-sm text-muted-foreground">Choose real-time or daily digest notifications via SMS or email</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">3. Stay Informed</h3>
              <p className="text-sm text-muted-foreground">Get notified when your representatives vote on bills in the Wyoming Legislature</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Wyoming Legislative Vote Tracker • Non-partisan • Free • Open Source</p>
          <p className="mt-2">Data sourced from the official Wyoming Legislature website</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;