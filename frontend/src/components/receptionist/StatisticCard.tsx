type StatisticCardProps = {
  title: string;
  value: number;
};

function StatisticCard({ title, value }: StatisticCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl">
      <h3 className="text-gray-500">{title}</h3>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default StatisticCard;