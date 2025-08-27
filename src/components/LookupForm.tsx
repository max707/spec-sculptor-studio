import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Info, Loader2 } from "lucide-react";

interface District {
  chamber: string;
  district: string;
  type: 'exact' | 'possible';
}

interface LookupFormProps {
  onDistrictsFound: (districts: {chamber: string, district: string}[]) => void;
}

export const LookupForm = ({ onDistrictsFound }: LookupFormProps) => {
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{exact: District[], possible: District[], explain?: string} | null>(null);
  const [selectedPossible, setSelectedPossible] = useState<string[]>([]);
  const { toast } = useToast();

  const validateWyomingInput = (input: string): boolean => {
    const zipRegex = /^82\d{3}$/;
    const addressRegex = /wyoming|wy/i;
    
    if (input.length === 5 && zipRegex.test(input)) {
      return true;
    }
    
    if (input.length > 10 && addressRegex.test(input)) {
      return true;
    }
    
    return false;
  };

  const handleLookup = async () => {
    const inputValue = address || zip;
    
    if (!inputValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter an address or ZIP code",
        variant: "destructive"
      });
      return;
    }

    if (!validateWyomingInput(inputValue)) {
      toast({
        title: "Wyoming Only",
        description: "This service is only available for Wyoming addresses and ZIP codes (82xxx)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('lookup-districts', {
        body: { 
          address: address || undefined, 
          zip: zip || undefined 
        }
      });

      if (error) throw error;

      setResults(data);
      
      // If we have exact results, automatically set them
      if (data.exact && data.exact.length > 0) {
        onDistrictsFound(data.exact.map((d: District) => ({
          chamber: d.chamber,
          district: d.district
        })));
      }

      toast({
        title: "Success",
        description: `Found ${data.exact?.length || 0} exact matches and ${data.possible?.length || 0} possible matches`
      });

    } catch (error) {
      console.error('Lookup error:', error);
      toast({
        title: "Error",
        description: "Failed to lookup districts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPossible = (districtKey: string) => {
    setSelectedPossible(prev => 
      prev.includes(districtKey) 
        ? prev.filter(k => k !== districtKey)
        : [...prev, districtKey]
    );
  };

  const handleConfirmPossible = () => {
    if (!results) return;
    
    const selected = results.possible.filter(d => 
      selectedPossible.includes(`${d.chamber}-${d.district}`)
    );
    
    const combined = [
      ...(results.exact || []),
      ...selected
    ];
    
    onDistrictsFound(combined.map(d => ({
      chamber: d.chamber,
      district: d.district
    })));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="address">Wyoming Address</Label>
          <Input
            id="address"
            placeholder="123 Main St, Cheyenne, WY 82001"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setZip(""); // Clear ZIP when typing address
            }}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        
        <div>
          <Label htmlFor="zip">Wyoming ZIP Code</Label>
          <Input
            id="zip"
            placeholder="82001"
            value={zip}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
              setZip(value);
              setAddress(""); // Clear address when typing ZIP
            }}
            maxLength={5}
          />
        </div>
      </div>

      <Button 
        onClick={handleLookup}
        disabled={loading}
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <MapPin className="mr-2 h-4 w-4" />
        Find My Legislators
      </Button>

      {results && (
        <div className="space-y-4">
          {results.exact && results.exact.length > 0 && (
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                <strong>Your Districts:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {results.exact.map((district, index) => (
                    <Badge key={index} variant="default">
                      {district.chamber === 'house' ? 'House' : 'Senate'} District {district.district}
                    </Badge>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {results.possible && results.possible.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Possible Districts:</strong>
                <p className="text-sm mt-1 mb-3">{results.explain}</p>
                <div className="space-y-2">
                  {results.possible.map((district, index) => {
                    const key = `${district.chamber}-${district.district}`;
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={key}
                          checked={selectedPossible.includes(key)}
                          onChange={() => handleSelectPossible(key)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={key} className="text-sm">
                          {district.chamber === 'house' ? 'House' : 'Senate'} District {district.district}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {selectedPossible.length > 0 && (
                  <Button 
                    onClick={handleConfirmPossible}
                    size="sm"
                    className="mt-3"
                  >
                    Subscribe to Selected Districts
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};