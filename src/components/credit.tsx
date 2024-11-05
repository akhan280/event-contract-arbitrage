"use client"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Credit() {
  return (
    <div className="flex flex-row items-center justify-center  gap-1 p-7 max-w-lg z-20">
      <div>Created by</div>
      <a 
        href="https://x.com/areebkhan280" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex flex-row items-center rounded-full hover:bg-[#FAFAFA] transition-all duration-300 p-1"
      >
        <Avatar className="w-6 h-6 mr-2">
          <AvatarImage src="https://media.licdn.com/dms/image/v2/D5603AQFlwPCPn-MAmg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1712365146078?e=1736380800&v=beta&t=cLIbJsJSnKqANnJtpexPPcgTC1_HZyg2BkOaEwW8PuQ" />
          <AvatarFallback>AK</AvatarFallback>
        </Avatar>
        <div>Areeb</div>
      </a>
      and
      <a 
        href="https://www.linkedin.com/in/sujay-mehta/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex flex-row items-center rounded-full hover:bg-[#FAFAFA] transition-all duration-300 p-1"
      >
        <Avatar className="w-6 h-6 mr-2">
          <AvatarImage src="https://media.licdn.com/dms/image/v2/D5603AQHhnjBxXT9miA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1670212577389?e=1736380800&v=beta&t=fed_yi_D5slE9sQwe9duJb9vwUBK0KMDaEdM7BlPw9s" />
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <div>Sujay</div>
      </a>
    </div>
  );
}