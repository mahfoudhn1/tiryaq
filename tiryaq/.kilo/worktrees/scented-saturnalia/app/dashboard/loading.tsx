export default function DashboardLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f5f9fa] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-16 rounded-2xl bg-[#e2eaee]" />
        <div className="h-40 rounded-[28px] bg-[#dff5f5]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 rounded-2xl bg-white" />)}
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="h-[420px] rounded-[26px] bg-white" />
          <div className="h-[420px] rounded-[26px] bg-white" />
        </div>
      </div>
    </div>
  );
}
