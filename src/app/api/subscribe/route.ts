
import { NextRequest } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Send confirmation email
    const response = await resend.emails.send({
      from: 'Arbitrage Alerts <alerts@eventarb.com>',
      to: email,
      subject: 'Welcome to Arbitrage Alerts',
      html: `
        <h1>Welcome to Arbitrage Alerts!</h1>
        <p>Thank you for subscribing. You'll receive alerts when new arbitrage opportunities become available.</p>
        <p>If you didn't sign up for this service, please ignore this email.</p>
      `
    });
    console.log("resposne", response)

    // Here you would typically also save the email to your database
    
    return new Response(JSON.stringify({ message: 'Subscribed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'An error occured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}