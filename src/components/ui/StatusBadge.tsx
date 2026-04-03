export default function StatusBadge({ label, type }: { label: string, type: 'status' | 'priority' }) {
  let colorClass = "bg-[#2a2e35] text-[#888780]"; // Default

  if (type === 'priority') {
    if (label === 'urgent') colorClass = "bg-[#E24B4A]/20 text-[#E24B4A] border border-[#E24B4A]/30";
    if (label === 'medium') colorClass = "bg-[#EF9F27]/20 text-[#EF9F27] border border-[#EF9F27]/30";
    if (label === 'low') colorClass = "bg-[#378ADD]/20 text-[#378ADD] border border-[#378ADD]/30";
  } else {
    if (label === 'unassigned') colorClass = "bg-[#2a2e35] text-[#888780]";
    if (label === 'in_progress') colorClass = "bg-[#EF9F27]/20 text-[#EF9F27]";
    if (label === 'completed') colorClass = "bg-[#1d9e75]/20 text-[#1d9e75]";
  }

  return (
    <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase ${colorClass}`}>
      {label.replace('_', ' ')}
    </span>
  );
}