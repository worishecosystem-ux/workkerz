import { AdminProvider } from "../components/context/AdminContext";
import AdminPushNotifications from "./components/AdminPushNotifications";
import AdminIncomingNotification from "./components/AdminIncomingNotification";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminPushNotifications />
      <AdminIncomingNotification />
      {children}
    </AdminProvider>
  );
}