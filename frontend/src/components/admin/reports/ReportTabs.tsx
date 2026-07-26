interface ReportTabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

const tabs = [
  {
    id: "operations",
    label: "Operations",
  },
  {
    id: "bookings",
    label: "Bookings",
  },
  {
    id: "revenue",
    label: "Revenue",
  },
  {
    id: "access",
    label: "Access Logs",
  },
  {
    id: "audit",
    label: "Audit Logs",
  },
];

export default function ReportTabs({
  activeTab,
  onChange,
}: ReportTabsProps) {
  return (
    <div className="mt-8 overflow-x-auto">
      <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">

        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap
                ${
                  active
                    ? "bg-yellow-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              {tab.label}
            </button>
          );
        })}

      </div>
    </div>
  );
}