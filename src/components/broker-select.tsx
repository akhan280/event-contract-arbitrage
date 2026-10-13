import React from "react";
import Image from "next/image";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Broker, BROKERS } from "@/lib/types";

const brokerLogos: Record<Broker, string> = {
  Polymarket: "/polymarket.png",
  Kalshi: "/kalshi.jpg",
  Robinhood: "/robinhood.png",
};

function BrokerLabel({ broker }: { broker: Broker }) {
  return (
    <div className="flex items-center gap-2">
      <Image src={brokerLogos[broker]} alt="" width={20} height={20} className="object-contain rounded-full" />
      {broker}
    </div>
  );
}

interface BrokerSelectProps {
  value: Broker;
  onChange: (value: Broker) => void;
}

const BrokerSelect: React.FC<BrokerSelectProps> = ({ value, onChange }) => (
  <Select value={value} onValueChange={(v) => onChange(v as Broker)}>
    <SelectTrigger className="w-44 bg-white" aria-label="Venue">
      <SelectValue>
        <BrokerLabel broker={value} />
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      {BROKERS.map((broker) => (
        <SelectItem key={broker} value={broker}>
          <BrokerLabel broker={broker} />
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default BrokerSelect;
