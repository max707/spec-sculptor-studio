import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Mail, Phone, ExternalLink, Users } from "lucide-react";

interface Legislator {
  id: number;
  chamber: string;
  district_code: string;
  name: string;
  party: string;
  email: string;
  phone: string;
  profile_url: string;
  active: boolean;
}

export const LegislatorList = () => {
  const [legislators, setLegislators] = useState<Legislator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [chamber, setChamber] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchLegislators();
  }, []);

  const fetchLegislators = async () => {
    try {
      const { data, error } = await supabase
        .from('legislators')
        .select('*')
        .eq('active', true)
        .order('chamber', { ascending: true })
        .order('district_code', { ascending: true });

      if (error) throw error;
      setLegislators(data || []);
    } catch (error) {
      console.error('Error fetching legislators:', error);
      toast({
        title: "Error",
        description: "Failed to load legislators",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLegislators = legislators.filter(legislator => {
    const matchesSearch = search === "" || 
      legislator.name.toLowerCase().includes(search.toLowerCase()) ||
      legislator.district_code.toLowerCase().includes(search.toLowerCase()) ||
      legislator.party.toLowerCase().includes(search.toLowerCase());
    
    const matchesChamber = chamber === "all" || legislator.chamber === chamber;
    
    return matchesSearch && matchesChamber;
  });

  const houseMembers = filteredLegislators.filter(l => l.chamber === 'house');
  const senateMembers = filteredLegislators.filter(l => l.chamber === 'senate');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Loading legislators...</p>
        </div>
      </div>
    );
  }

  const LegislatorCard = ({ legislator }: { legislator: Legislator }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{legislator.name}</h3>
              <Badge variant={legislator.party === 'Republican' ? 'destructive' : 'secondary'}>
                {legislator.party === 'Republican' ? 'R' : legislator.party === 'Democratic' ? 'D' : legislator.party}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {legislator.chamber === 'house' ? 'House' : 'Senate'} District {legislator.district_code.replace(/[HD]/g, '')}
            </p>
            
            <div className="space-y-1">
              {legislator.email && (
                <a 
                  href={`mailto:${legislator.email}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="h-3 w-3" />
                  {legislator.email}
                </a>
              )}
              
              {legislator.phone && (
                <a 
                  href={`tel:${legislator.phone}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  {legislator.phone}
                </a>
              )}
              
              {legislator.profile_url && (
                <a 
                  href={legislator.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Official Profile
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, district, or party..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => window.open('https://www.wyoleg.gov/Legislators/2025', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Official List
        </Button>
      </div>

      <Tabs value={chamber} onValueChange={setChamber} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({filteredLegislators.length})</TabsTrigger>
          <TabsTrigger value="house">House ({houseMembers.length})</TabsTrigger>
          <TabsTrigger value="senate">Senate ({senateMembers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredLegislators.map(legislator => (
              <LegislatorCard key={legislator.id} legislator={legislator} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="house" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {houseMembers.map(legislator => (
              <LegislatorCard key={legislator.id} legislator={legislator} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="senate" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {senateMembers.map(legislator => (
              <LegislatorCard key={legislator.id} legislator={legislator} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredLegislators.length === 0 && !loading && (
        <div className="text-center py-8">
          <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No legislators found matching your search</p>
        </div>
      )}
    </div>
  );
};