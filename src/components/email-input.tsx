import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const EmailSubscription = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You'll receive alerts when new opportunities arise.",
          variant: "default",
        });
        setEmail('');
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Top-left triangle */}
      <div 
        className="absolute -top-4 -left-6 w-16 h-16  z-20 transform rotate-60 bg-[#00D991]"
        style={{
          clipPath: 'polygon(0 0, 0% 100%, 100% 0)',
        }}
      />
      
      {/* Bottom-right triangle */}
      <div 
        className="absolute -bottom-4 -right-2 w-16 h-16 transform rotate-60 z-20 bg-[#2563EB]"
        style={{
          clipPath: 'polygon(100% 100%, 0% 100%, 100% 0)',
        }}
      />

      <Card className="w-full max-w-md outline outline-[0.5px] outline-[#DEDEDE] rounded-[32px] bg-white relative z-10">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-normal">
                Get free alerts when arbitrage opportunities open
              </h2>
            </div>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 outline-[0.2px] rounded-xl"
              />
              <Button type="submit" disabled={isLoading} className="rounded-xl">
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSubscription;