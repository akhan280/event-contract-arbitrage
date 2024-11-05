import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import Credit from "./credit"
  
  export function AdditionalInformation() {
    return (
      <div className="w-full">
        <div className="px-4 py-2 mb-3 bg-[#F6F6F6]/60 text-[22px] w-fit rounded-2xl text-start mx-6">
              More information
        </div>
        <Accordion type="single" collapsible className="w-full px-8">
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
      </div>
    )
  }
  