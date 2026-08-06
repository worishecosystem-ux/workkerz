type Props = {
  history: any[];
};

export default function OrderHistory({
  history,
}: Props) {
  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-4"
        >
          <div className="mt-2 h-3 w-3 rounded-full bg-orange-500" />

          <div>
            <p className="font-semibold">
              {item.status}
            </p>

            <p className="text-sm text-slate-500">
              {new Date(
                item.created_at
              ).toLocaleString()}
            </p>

            {item.note && (
              <p className="mt-1 text-sm">
                {item.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}