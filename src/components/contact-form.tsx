import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { submitSupportInquiry } from "../lib/actions";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  message: z.string().min(2, {
    message: "Message must be at least 2 characters.",
  }),
});

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      message: "",
    },
  });

  // Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    console.log(values);
    const response = await submitSupportInquiry(values);
    console.log(response);

    if (response.error) {
      setLoading(false);
      toast({
        title: "An error occured",
        variant: "destructive",
      });
    }
    toast({
      title: "Successfully submitted, we'll be in touch",
      variant: "default",
    });
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormDescription>
                What&apos;s your name?
              </FormDescription>
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
                <Input placeholder="Enter your message" {...field} />
              </FormControl>
              <FormDescription>
                Enter your message/inquiry here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {loading ? (
          <Button disabled className="py-2 rounded-xl">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit">submit</Button>
        )}{" "}
      </form>
    </Form>
  );
}