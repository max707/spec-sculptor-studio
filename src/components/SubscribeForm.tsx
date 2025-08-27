import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, Phone, Mail } from "lucide-react";

interface SubscribeFormProps {
  selectedDistricts: {chamber: string, district: string}[];
}

export const SubscribeForm = ({ selectedDistricts }: SubscribeFormProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState("realtime");
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const validatePhone = (phoneNumber: string): boolean => {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a 307 area code (Wyoming)
    return digits.length === 10 && digits.startsWith('307');
  };

  const formatPhone = (phoneNumber: string): string => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length >= 10) {
      return `+1${digits.slice(0, 10)}`;
    }
    return phoneNumber;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !phone) {
      toast({
        title: "Error",
        description: "Please provide either an email address or phone number",
        variant: "destructive"
      });
      return;
    }

    if (phone && !validatePhone(phone)) {
      toast({
        title: "Wyoming Only",
        description: "Phone number must be a Wyoming number (307 area code)",
        variant: "destructive"
      });
      return;
    }

    if (!consentChecked) {
      toast({
        title: "Error", 
        description: "Please agree to receive messages",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('subscribe', {
        body: {
          email: email || undefined,
          phone: phone ? formatPhone(phone) : undefined,
          selectedDistricts: selectedDistricts.map(d => `${d.chamber.toUpperCase()[0]}${d.district.padStart(2, '0')}`),
          mode,
          consentCheckbox: true
        }
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Success!",
        description: phone 
          ? "Subscription created! Please check your phone for SMS confirmation."
          : "Subscription created! Please check your email for confirmation."
      });

    } catch (error) {
      console.error('Subscribe error:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert>
        <Check className="h-4 w-4" />
        <AlertDescription>
          <strong>Subscription Created!</strong>
          <p className="mt-2">
            {phone && "Please check your phone for an SMS confirmation link. "}
            {email && "Please check your email for confirmation. "}
            You'll start receiving vote alerts once confirmed.
          </p>
          {phone && (
            <p className="mt-2 text-sm text-muted-foreground">
              Reply STOP to cancel or HELP for assistance at any time.
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address (optional)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Wyoming Phone Number (optional)
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(307) 555-1234"
            value={phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              const formatted = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
              setPhone(formatted);
            }}
            maxLength={14}
          />
          <p className="text-xs text-muted-foreground mt-1">
            SMS only available for Wyoming (307) numbers
          </p>
        </div>

        <div>
          <Label className="text-base font-medium">Notification Frequency</Label>
          <RadioGroup value={mode} onValueChange={setMode} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="realtime" id="realtime" />
              <Label htmlFor="realtime">Real-time (immediate alerts)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Daily digest (~7pm MT)</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="consent"
            checked={consentChecked}
            onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
          />
          <Label htmlFor="consent" className="text-sm leading-relaxed">
            I agree to receive messages about my Wyoming legislators' votes. 
            Msg/data rates may apply. Reply STOP to cancel, HELP for help.
          </Label>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Subscribe to Vote Alerts
      </Button>
    </form>
  );
};