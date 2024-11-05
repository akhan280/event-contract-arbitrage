import React from 'react';
import Image from 'next/image';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type BrokerType = 'Polymarket' | 'Kalshi';

const brokerLogos: Record<BrokerType, string> = {
  Polymarket: "/polymarket.png",
  Kalshi: "/kalshi.jpg"
};

interface BrokerSelectProps {
  value: BrokerType;
  onChange: (value: BrokerType) => void;
}

const BrokerSelect: React.FC<BrokerSelectProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-row justify-between items-center gap-2 w-full">
        <div className='flex flex-row justify-center items-center gap-3'>
            <Image
                src={brokerLogos[value]}
                alt={value}
                width={20}
                height={20}
                className="object-contain"
            />     
            <div>{value}</div>   
        </div>
        <div>
            <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
            <SelectValue>
                <div className="flex items-center gap-2">
                {value && (
                    <Image
                    src={brokerLogos[value]}
                    alt={value}
                    width={20}
                    height={20}
                    className="object-contain"
                    />
                )}
                {value || "Select Broker"}
                </div>
            </SelectValue>
            </SelectTrigger>
            <SelectContent>
            {(Object.keys(brokerLogos) as BrokerType[]).map((broker) => (
                <SelectItem key={broker} value={broker}>
                <div className="flex items-center gap-2">
                    <Image
                    src={brokerLogos[broker]}
                    alt={broker}
                    width={20}
                    height={20}
                    className="object-contain"
                    />
                    {broker}
                </div>
                </SelectItem>
            ))}
            </SelectContent>
        </Select>
        </div>

    </div>
  );
};

export default BrokerSelect;