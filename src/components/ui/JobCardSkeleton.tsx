export default function JobCardSkeleton() {
  return (
    <div className="bg-[#1e2329] border border-[#2a2e35] rounded-md p-3 mb-3 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-4 bg-[#2a2e35] rounded w-1/3"></div>
        <div className="h-4 bg-[#2a2e35] rounded w-12"></div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-[#2a2e35] rounded w-3/4"></div>
        <div className="h-3 bg-[#2a2e35] rounded w-1/2"></div>
      </div>

      <div className="h-8 bg-[#161a1e] rounded w-full"></div>
    </div>
  );
}