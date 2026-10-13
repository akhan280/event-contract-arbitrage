"use client";
import React, { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Calculator, Bug, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ContactForm } from "./contact-form";
import { FEE_RULES } from "@/lib/arbitrage";
import { BROKERS } from "@/lib/types";

export function AdditionalInformation() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-4 sm:px-8">
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="guide" className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-lg font-medium">How to Guide</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 border-t bg-gray-50 text-gray-600 space-y-2">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Enter the market title, the days to expiration, and the amount to invest.</li>
              <li>Pick Binary for Yes/No markets, or Multiple Choice for markets with several options.</li>
              <li>Add one card for each venue, and enter the Yes and No ask prices in cents.</li>
              <li>Click Calculate Arbitrage.</li>
            </ol>
            <a
              href="https://docs.google.com/document/d/1C5DWdrFbJzoltCERUGBZfXsBLlUBKiLJoqwe-egIekg/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              Full guide
              <ExternalLink className="w-4 h-4" />
            </a>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="math" className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-lg font-medium">The Math</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 border-t bg-gray-50 text-gray-600 space-y-3">
            <p>Each contract pays $1 if it wins and $0 if it loses. The calculator looks for sets of contracts that pay out whatever the result:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <b>Yes + No:</b> Yes on one venue and No on another. One side always pays $1.
              </li>
              <li>
                <b>Yes on every option:</b> exactly one option wins, so the set pays $1.
              </li>
              <li>
                <b>No on every option:</b> every option except the winner pays, so a set of N options pays $(N − 1).
              </li>
            </ul>
            <p>
              If a set costs less than its payout after fees, it is an arbitrage. The calculator buys as many sets as the
              principal allows. Return = profit ÷ cost. Annualized = return × 365 ÷ days to expiration (not compounded).
            </p>
            <p className="text-sm">Fees used:</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {BROKERS.map((b) => (
                <li key={b}>
                  {b}: {FEE_RULES[b].label}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogTrigger className="mt-4 border rounded-xl overflow-hidden bg-white shadow-sm w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Bug className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-lg font-medium">Contact / Report Bugs</span>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact us</DialogTitle>
            <DialogDescription>Report a bug or ask a question. We reply by email.</DialogDescription>
          </DialogHeader>
          <ContactForm onSent={() => setContactOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdditionalInformation;
