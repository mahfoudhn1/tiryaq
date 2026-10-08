export default function DashboardLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-[#F4F9FD] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-16 rounded-2xl bg-[#0369A1]/12" />
        <div className="h-40 rounded-[28px] bg-[#CFE9FB]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 rounded-2xl bg-white/75" />)}
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="h-[420px] rounded-[26px] bg-white/75" />
          <div className="h-[420px] rounded-[26px] bg-white/75" />
        </div>
      </div>
    </div>
  );
}
