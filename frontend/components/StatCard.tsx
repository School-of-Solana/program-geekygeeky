export default function StatCard({
    label,
    value,
    icon,
    valuePadding,
}: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    valuePadding?: boolean;
}) {
    return (
        <div
            className="
        p-4 rounded-xl border border-slate-300 
        bg-gradient-to-br from-slate-700 to-slate-400 
        backdrop-blur-sm shadow-sm 
        transition-transform duration-200 
        hover:scale-[1.02] hover:shadow-md mb-1
      "
        >
            <div className="flex items-center gap-3 mb-1">
                {icon && <span className="text-white-700 text-xl">{icon}</span>}
                <p className="text-sm text-white-700 font-bold">{label}</p>
            </div>

            <p className={`text-2xl font-bold text-grey-100 ${valuePadding ? 'pl-1.5' : ''}`}>{value}</p>
        </div>
    );
}
