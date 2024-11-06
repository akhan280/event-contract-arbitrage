import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Calculator,
  Bug,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Credit from "./credit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ContactForm } from "./contact-form";

export function AdditionalInformation() {
  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-8">
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem
          value="item-1"
          className="border rounded-xl overflow-hidden bg-white shadow-sm"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-lg font-medium">How to Guide</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <p className="text-gray-600">Access our comprehensive guide</p>
              <a
                href="https://docs.google.com/document/d/1C5DWdrFbJzoltCERUGBZfXsBLlUBKiLJoqwe-egIekg/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                here
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-2"
          className="border rounded-xl overflow-hidden bg-white shadow-sm"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-lg font-medium">The Math</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 border-t bg-gray-50">
            <p className="text-gray-600">
              Take a look at the math behind the arbitrage calculations here.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="pt-4"></div>
      <Dialog>
        <DialogTrigger className="border rounded-xl overflow-hidden bg-white shadow-sm w-full">
          <div className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Bug className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-lg font-medium">Contact / Report Bugs</span>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent>
          <ContactForm></ContactForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdditionalInformation;
