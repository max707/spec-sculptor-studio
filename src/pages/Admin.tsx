import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Admin = () => {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-legislators');
      
      if (error) {
        console.error('Import error:', error);
        toast({
          title: "Import Failed",
          description: error.message || "Failed to import legislators",
          variant: "destructive",
        });
      } else {
        console.log('Import success:', data);
        toast({
          title: "Import Successful",
          description: `Successfully imported ${data.imported} legislators`,
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Capitol Crier Admin
          </h1>
          <p className="text-muted-foreground">
            Administrative tools for managing the application
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Legislator Data</CardTitle>
              <CardDescription>
                Import current Wyoming legislators into the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleImport} 
                disabled={importing}
                className="w-full"
              >
                {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {importing ? "Importing..." : "Import Legislators"}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This will clear existing data and import current 2025 session legislators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test District Lookup</CardTitle>
              <CardDescription>
                Test the district lookup functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Sample Addresses to Test:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 123 Main St, Cheyenne, WY 82001</li>
                      <li>• 456 Oak Ave, Casper, WY 82601</li>
                      <li>• 789 Pine Rd, Laramie, WY 82070</li>
                      <li>• 321 Elm St, Gillette, WY 82716</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">ZIP Codes to Test:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 82001 (Cheyenne)</li>
                      <li>• 82602 (Casper)</li>
                      <li>• 82081 (Laramie)</li>
                      <li>• 82716 (Gillette)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;