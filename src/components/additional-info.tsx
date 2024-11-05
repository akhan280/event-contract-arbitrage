import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  
  export function AdditionalInformation() {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>How to guide</AccordionTrigger>
          <AccordionContent>
          Here is a <a href="https://docs.google.com/document/d/1C5DWdrFbJzoltCERUGBZfXsBLlUBKiLJoqwe-egIekg/edit?usp=sharing" target="_blank" rel="noopener noreferrer">doc</a> explaining exactly how to use our calculator.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>The math</AccordionTrigger>
          <AccordionContent>
          Take a look at the math behind the arbitrage calculations here.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Contact / Report Bugs</AccordionTrigger>
          <AccordionContent>
          Submit any bugs you find or contact us here.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }
  