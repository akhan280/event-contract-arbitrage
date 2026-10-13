import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { submitSupportInquiry } from "../lib/actions";
import { supportSchema } from "../lib/schemas";
import { toast } from "../hooks/use-toast";

type SupportValues = z.infer<typeof supportSchema>;

export function ContactForm({ onSent }: { onSent?: () => void }) {
  const [loading, setLoading] = useState(false);

  const form = useForm<SupportValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  async function onSubmit(values: SupportValues) {
    setLoading(true);
    const response = await submitSupportInquiry(values);
    setLoading(false);

    if (response.error) {
      toast({ title: "Could not send your message. Please try again.", variant: "destructive" });
      return;
    }
    toast({ title: "Message sent. We will reply by email." });
    form.reset();
    onSent?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="What happened, or what would you like to see?" rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="rounded-xl">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Sending…" : "Send"}
        </Button>
      </form>
    </Form>
  );
}
