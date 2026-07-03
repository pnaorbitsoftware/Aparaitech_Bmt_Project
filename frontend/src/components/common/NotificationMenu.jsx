import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { API } from "../../services/api";

export default function NotificationMenu({ tokenKey = "token" }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const request = (config) => API.request({
    ...config,
    headers: { ...config.headers, Authorization: `Bearer ${localStorage.getItem(tokenKey)}` },
  });

  const load = async () => {
    if (!localStorage.getItem(tokenKey)) return;
    setLoading(true);
    try {
      const { data } = await request({ url: "/notifications" });
      setItems(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch (error) {
      console.error("Unable to load notifications", error.response?.data?.message || error.message);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [tokenKey]);

  const markAllRead = async () => {
    await request({ method: "patch", url: "/notifications/read-all" });
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative">
      <button type="button" aria-label="Notifications" onClick={() => { setOpen((value) => !value); if (!open) load(); }} className="relative rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50">
        <Bell size={19} />
        {unread > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-center text-xs font-bold text-white">{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-[80] w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div><p className="font-bold text-slate-900">Notifications</p><p className="text-xs text-slate-500">{unread} unread</p></div>
            {unread > 0 && <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-semibold text-green-700"><CheckCheck size={14}/> Mark all read</button>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 ? <p className="p-6 text-center text-sm text-slate-500">Loading notifications…</p>
              : items.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">You’re all caught up.</p>
              : items.map((item) => <div key={item._id} className={`border-b px-4 py-3 ${item.read ? "bg-white" : "bg-green-50"}`}>
                  <div className="flex gap-2"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-slate-200" : "bg-green-500"}`}/><div><p className="text-sm font-semibold text-slate-900">{item.title}</p><p className="mt-0.5 text-xs leading-5 text-slate-600">{item.message}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</p></div></div>
                </div>)}
          </div>
        </div>
      )}
    </div>
  );
}
