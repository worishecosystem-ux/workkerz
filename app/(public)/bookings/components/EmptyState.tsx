export default function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center"><h2 className="text-sm font-bold text-slate-900">{title}</h2><p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p></div>;
}
