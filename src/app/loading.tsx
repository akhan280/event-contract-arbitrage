import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[30%_70%] min-h-screen sm:h-screen sm:overflow-hidden">
      <div className="order-2 sm:order-1 min-h-screen sm:h-screen flex flex-col">
        <div className="hidden sm:block">
          <Skeleton className="h-16 w-full" /> {/* Header */}
        </div>
        <div className="flex-1 flex flex-col justify-evenly items-center">
          <Skeleton className="w-[80%] h-[300px] rounded-xl" /> {/* AdditionalInformation */}
          <div className="p-4 w-full flex justify-center">
            <Skeleton className="w-[80%] h-[100px] rounded-xl" /> {/* EmailSubscription */}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full mb-6">
          <Skeleton className="w-[200px] h-8" /> {/* Credit */}
        </div>
      </div>

      <div className="order-1 sm:order-2 overflow-y-auto border-t sm:border-t-0 sm:border-l border-black/20">
        <Card className="mb-8">
          <div className="sm:hidden">
            <Skeleton className="h-16 w-full" /> {/* Mobile Header */}
          </div>
          <CardContent>
            <div className="space-y-6">
              {/* Market Title and Settings */}
              <div className="flex flex-col gap-7">
                <div className="flex flex-row py-4">
                  <Skeleton className="h-14 w-1/2" /> {/* Market Title */}
                  <div className="flex flex-row gap-4 ml-auto">
                    <div className="w-fit">
                      <Skeleton className="h-4 w-32 mb-2" /> {/* Contract Length Label */}
                      <Skeleton className="h-10 w-32" /> {/* Contract Length Input */}
                    </div>
                    <div className="w-fit">
                      <Skeleton className="h-4 w-32 mb-2" /> {/* Principal Label */}
                      <Skeleton className="h-10 w-32" /> {/* Principal Input */}
                    </div>
                  </div>
                </div>

                {/* Market Cards */}
                {[1, 2].map((i) => (
                  <Card key={i} className="mb-4 bg-[#F6F6F6]/60 p-6 rounded-xl">
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-40" /> {/* Broker Select */}
                      <div className="flex justify-between">
                        <Skeleton className="h-10 w-48" /> {/* Market Type Tabs */}
                        <Skeleton className="h-10 w-10" /> {/* Delete Button */}
                      </div>
                      {/* Option Inputs */}
                      {[1].map((j) => (
                        <div key={j} className="flex items-center gap-4">
                          <Skeleton className="h-14 flex-1" />
                          <Skeleton className="h-14 flex-1" />
                          <Skeleton className="h-14 flex-1" />
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Bottom Buttons */}
              <div className="flex flex-row gap-2">
                <Skeleton className="h-10 flex-1" /> {/* Add Market Button */}
                <Skeleton className="h-10 flex-1" /> {/* Calculate Button */}
              </div>

              <Skeleton className="h-10 w-full" /> {/* Share Button */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}