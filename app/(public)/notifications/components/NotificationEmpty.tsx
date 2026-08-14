export default function NotificationEmpty() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">
        🔔
      </div>

      <h2 className="mt-4 text-base font-semibold text-gray-900">
        No notifications
      </h2>

      <p className="mt-1 max-w-sm text-sm text-gray-500">
        You&apos;re all caught up. New Workkerz updates and
        activity will appear here.
      </p>
    </div>
  );
}