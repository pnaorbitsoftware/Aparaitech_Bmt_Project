import {
  TrendingUp,
  Wallet,
  Users,
  AlertTriangle,
  CreditCard,
  BarChart2,
  Activity,
  Sparkles
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { useEffect, useState } from "react";
import { API } from "../../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [recentTx, setRecentTx] = useState([]);

  /* 🔴 LOW STOCK */
  const [lowStock, setLowStock] = useState({ count: 0, items: [] });
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  /* ================= LOAD ALL ================= */
  const loadAll = async () => {
    await Promise.all([
      loadStats(),
      loadWeeklyRevenue(),
      loadPaymentChart(),
      loadRecentTransactions(),
      loadLowStock()
    ]);
  };

  const loadStats = async () => {
    try {
      const res = await API.get("/dashboard/stats");
      setStats(res.data.stats || res.data || {});
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const loadWeeklyRevenue = async () => {
    try {
      const res = await API.get("/dashboard/weekly-revenue");
      setWeeklyRevenue(res.data || []);
    } catch (err) {
      console.error("Failed to load weekly revenue:", err);
    }
  };

  const loadPaymentChart = async () => {
    try {
      const res = await API.get("/dashboard/payment-chart");
      setPaymentData(res.data || []);
    } catch (err) {
      console.error("Failed to load payment chart:", err);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const res = await API.get("/dashboard/recent-transactions");
      setRecentTx(res.data || []);
    } catch (err) {
      console.error("Failed to load recent transactions:", err);
    }
  };

  const loadLowStock = async () => {
    try {
      const res = await API.get("/dashboard/low-stock");
      setLowStock(res.data || { count: 0, items: [] });
    } catch (err) {
      console.error("Failed to load low stock:", err);
    }
  };

  const getInsight = () => {
    if ((stats.todayRevenue || 0) > 5000)
      return "Great sales today! Consider promoting add-on items.";
    if (paymentData.find(p => p.payment_mode === "UPI"))
      return "UPI is popular. Offer UPI cashback to boost conversions.";
    return "Sales are slow. Try limited-time discounts.";
  };

  return (
    <div className="space-y-8">

      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold">Business Intelligence</h1>
        <p className="text-gray-500 mt-1">
          Holistic view of your store performance
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Daily Revenue" value={`₹${stats.todayRevenue || 0}`} icon={<TrendingUp />} />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue || 0}`} icon={<Wallet />} />
        <StatCard title="Orders Today" value={stats.todaySales || 0} icon={<Users />} />

        <StatCard
          title="Critical Stock"
          value={lowStock.count}
          icon={<AlertTriangle className="text-red-600" />}
          danger
          onClick={() => setShowLowStock(true)}
        />
      </div>

      {/* GRAPH + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          onClick={() => navigate("/reports")}
          className="lg:col-span-2 bg-white p-6 rounded-2xl shadow cursor-pointer"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart2 className="text-green-500" />
            Revenue Trajectory (Weekly)
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyRevenue}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-700 text-white p-6 rounded-2xl">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles /> Retail Strategy Engine
          </h2>
          <p className="text-sm text-green-100">{getInsight()}</p>
        </div>
      </div>

      {/* PAYMENT + TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="text-green-500" /> Payment Preference
          </h2>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={paymentData} dataKey="count" nameKey="payment_mode" outerRadius={80} label>
                {paymentData.map((_, i) => (
                  <Cell key={i} fill={["#16a34a", "#2563eb", "#f59e0b", "#ef4444"][i % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="text-green-500" /> Live Transactions
          </h2>

          <ul className="space-y-3">
            {recentTx.map((tx, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{tx.bill_no}</span>
                <span className="font-semibold">₹{tx.total}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* LOW STOCK MODAL */}
      {showLowStock && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-red-600">🚨 Critical Stock</h2>
              <button onClick={() => setShowLowStock(false)}>✕</button>
            </div>

            {lowStock.items.length === 0 ? (
              <p className="text-green-600">All items are sufficiently stocked ✅</p>
            ) : (
              <div className="space-y-3">
                {lowStock.items.map(p => (
                  <div key={p.id} className="flex justify-between bg-red-50 p-3 rounded">
                    <span>{p.name} ({p.sku})</span>
                    <span className="font-bold text-red-600">{p.stock} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* STAT CARD */
function StatCard({ title, value, icon, onClick, danger }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-2xl shadow flex items-center gap-4
        ${onClick ? "cursor-pointer hover:shadow-lg transition" : ""}
      `}
    >
      <div className={`p-3 rounded-xl ${danger ? "bg-red-100 text-red-600" : "bg-green-50 text-green-600"}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-xl font-bold">{value}</h2>
      </div>
    </div>
  );
}

export default Dashboard;