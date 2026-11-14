import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Bus,
  MapPinned,
  Ticket,
  CreditCard,
  LogOut,
  Search,
  Bell,
  TrendingUp,
  Wallet,
  CalendarDays,
  CircleCheck,
  Menu,
  ArrowUpRight,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const initialBuses = [
  {
    id: 1,
    plate: "29B-998.88",
    type: "Giường nằm VIP",
    seats: 20,
    status: "ACTIVE",
  },
  {
    id: 2,
    plate: "51B-123.45",
    type: "Limousine",
    seats: 12,
    status: "ACTIVE",
  },
];

const navItems = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "users", label: "Tài khoản", icon: Users },
  { id: "trips", label: "Chuyến xe", icon: Bus },
  { id: "bookings", label: "Đặt vé", icon: Ticket },
  { id: "payments", label: "Thanh toán", icon: CreditCard },
  { id: "buses", label: "Quản lý xe", icon: MapPinned },
];

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const roleName = (role) =>
  ({
    ADMIN: "Quản trị viên",
    DRIVER: "Tài xế",
    CUSTOMER: "Khách hàng",
  })[role] || role;

const statusName = (status) =>
  ({
    ACTIVE: "Hoạt động",
    INACTIVE: "Ngừng hoạt động",
    SCHEDULED: "Sắp khởi hành",
    DEPARTED: "Đang chạy",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    CONFIRMED: "Đã xác nhận",
    PENDING: "Chờ xử lý",
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
    REFUNDED: "Đã hoàn tiền",
    MAINTENANCE: "Bảo trì",
  })[status] || status;

function Status({ value }) {
  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    SUCCESS: "bg-emerald-50 text-emerald-700",
    CONFIRMED: "bg-emerald-50 text-emerald-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    SCHEDULED: "bg-blue-50 text-blue-700",
    PENDING: "bg-amber-50 text-amber-700",
    DEPARTED: "bg-violet-50 text-violet-700",
    CANCELLED: "bg-rose-50 text-rose-700",
    FAILED: "bg-rose-50 text-rose-700",
    INACTIVE: "bg-slate-100 text-slate-600",
    MAINTENANCE: "bg-orange-50 text-orange-700",
    REFUNDED: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        styles[value] || "bg-slate-100 text-slate-600"
      }`}
    >
      {statusName(value)}
    </span>
  );
}

function StatCard({ title, value, note, icon: Icon, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
        {note}
      </p>
    </div>
  );
}

export default function AdminDashboard({ user, token, onLogout }) {
  const authToken = token || user?.token;

  const [active, setActive] = useState("overview");

  // Tài khoản lấy trực tiếp từ Backend
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Chuyến xe lấy trực tiếp từ Backend
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState("");
  const [updatingTripId, setUpdatingTripId] = useState(null);

  // Thanh toán lấy trực tiếp từ Backend
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState("");

  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");

  // Quản lý xe lấy trực tiếp từ Backend
  const [buses, setBuses] = useState([]);
  const [busesLoading, setBusesLoading] = useState(true);
  const [busesError, setBusesError] = useState("");
  const [updatingBusId, setUpdatingBusId] = useState(null);

  // Dữ liệu Dashboard từ Backend
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  // 5 đơn đặt vé gần đây
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentBookingsLoading, setRecentBookingsLoading] = useState(true);
  const [recentBookingsError, setRecentBookingsError] = useState("");

  // Tất cả đơn đặt vé
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");

  const overview = dashboardData?.overview;

  // Biểu đồ Dashboard
  const chartData = useMemo(() => {
    const revenue = dashboardData?.charts?.revenue || [];
    const bookingChart = dashboardData?.charts?.bookings || [];

    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      months.push({
        month: monthKey,
        label: `T${date.getMonth() + 1}`,
        revenue: 0,
        totalBookings: 0,
      });
    }

    const revenueMap = new Map(
      revenue.map((item) => [item.month, Number(item.revenue) || 0]),
    );

    const bookingMap = new Map(
      bookingChart.map((item) => [item.month, Number(item.totalBookings) || 0]),
    );

    const monthlyData = months.map((item) => ({
      ...item,
      revenue: revenueMap.get(item.month) || 0,
      totalBookings: bookingMap.get(item.month) || 0,
    }));

    const userData = (dashboardData?.charts?.users || []).map((item) => ({
      role: item.role,
      total: Number(item.total) || 0,
    }));

    const routeData = (dashboardData?.charts?.popularRoutes || []).map(
      (item) => ({
        route: `${item.origin} → ${item.destination}`,
        totalBookings: Number(item.totalBookings) || 0,
      }),
    );

    return {
      monthlyData,
      userData,
      routeData,
    };
  }, [dashboardData]);

  const roleColors = ["#10B981", "#6366F1", "#F59E0B"];

  // Lấy danh sách tài khoản từ Backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      if (!authToken) {
        setUsersError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setUsersLoading(false);
        return;
      }

      try {
        setUsersLoading(true);
        setUsersError("");

        const response = await fetch("http://localhost:5000/api/admin/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || "Không thể tải danh sách tài khoản.");
        }

        setUsers(
          (Array.isArray(data.users) ? data.users : []).map((item) => ({
            ...item,
            id: Number(item.id),
            active: Number(item.active) === 1 || item.active === true,
          })),
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Users API error:", error);
          setUsersError(error.message || "Không thể kết nối đến máy chủ.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setUsersLoading(false);
        }
      }
    };

    fetchUsers();

    return () => controller.abort();
  }, [authToken]);

  // Lấy danh sách chuyến xe từ Backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchTrips = async () => {
      if (!authToken) {
        setTripsError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setTripsLoading(false);
        return;
      }

      try {
        setTripsLoading(true);
        setTripsError("");

        const response = await fetch("http://localhost:5000/api/admin/trips", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || "Không thể tải danh sách chuyến xe.");
        }

        const normalizedTrips = (
          Array.isArray(data.trips) ? data.trips : []
        ).map((item) => {
          const departureDate = item.departure
            ? new Date(item.departure)
            : null;

          const formattedDeparture =
            departureDate && !Number.isNaN(departureDate.getTime())
              ? departureDate.toLocaleString("vi-VN")
              : "—";

          return {
            ...item,
            id: Number(item.id),
            route: item.route || "Chưa có thông tin tuyến",
            bus: item.bus || "—",
            driver: item.driver || "Chưa phân công",
            departure: formattedDeparture,
            price: Number(item.price || 0),
            status: item.status,
          };
        });

        setTrips(normalizedTrips);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Trips API error:", error);
          setTripsError(error.message || "Không thể kết nối đến máy chủ.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setTripsLoading(false);
        }
      }
    };

    fetchTrips();

    return () => controller.abort();
  }, [authToken]);

  // Lấy danh sách thanh toán từ Backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchPayments = async () => {
      if (!authToken) {
        setPaymentsError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setPaymentsLoading(false);
        return;
      }

      try {
        setPaymentsLoading(true);
        setPaymentsError("");

        const response = await fetch(
          "http://localhost:5000/api/admin/payments",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
          throw new Error(
            data.message || "Không thể tải danh sách thanh toán.",
          );
        }

        const normalizedPayments = (
          Array.isArray(data.payments) ? data.payments : []
        ).map((item) => {
          const paidDate = item.paid_at ? new Date(item.paid_at) : null;

          const formattedDate =
            paidDate && !Number.isNaN(paidDate.getTime())
              ? paidDate.toLocaleString("vi-VN")
              : "Chưa thanh toán";

          return {
            id: Number(item.id),
            code: item.transaction_id || `PAY-${item.id}`,
            booking: item.booking_code || "—",
            customer: item.customer_name || "Không rõ",
            phone: item.customer_phone || "—",
            route: item.route || "—",
            method: item.payment_method || "—",
            amount: Number(item.amount || 0),
            status: item.status,
            date: formattedDate,
          };
        });

        setPayments(normalizedPayments);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Payments API error:", error);
          setPaymentsError(error.message || "Không thể kết nối đến máy chủ.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setPaymentsLoading(false);
        }
      }
    };

    fetchPayments();

    return () => controller.abort();
  }, [authToken]);

  // Lấy danh sách xe từ Backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchBuses = async () => {
      if (!authToken) {
        setBusesError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setBusesLoading(false);
        return;
      }

      try {
        setBusesLoading(true);
        setBusesError("");

        const response = await fetch("http://localhost:5000/api/admin/buses", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || "Không thể tải danh sách xe.");
        }

        const normalizedBuses = (
          Array.isArray(data.buses) ? data.buses : []
        ).map((item) => ({
          id: Number(item.id),
          plate: item.plate_number || "—",
          type: item.bus_type || "—",
          floorCount: Number(item.floor_count || 0),
          seats: Number(item.total_seats || 0),
          totalTrips: Number(item.total_trips || 0),
          status: item.status,
        }));

        setBuses(normalizedBuses);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Buses API error:", error);
          setBusesError(error.message || "Không thể kết nối đến máy chủ.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setBusesLoading(false);
        }
      }
    };

    fetchBuses();

    return () => controller.abort();
  }, [authToken]);

  // Lấy số liệu tổng quan
  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboard = async () => {
      if (!authToken) {
        setDashboardError(
          "Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.",
        );
        setDashboardLoading(false);
        return;
      }

      try {
        setDashboardLoading(true);
        setDashboardError("");

        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || "Không thể tải dữ liệu Dashboard.");
        }

        setDashboardData(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Dashboard API error:", error);
          setDashboardError(error.message || "Không thể kết nối đến máy chủ.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setDashboardLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => controller.abort();
  }, [authToken]);

  // Lấy 5 đơn đặt vé gần đây
  useEffect(() => {
    const controller = new AbortController();

    const fetchRecentBookings = async () => {
      if (!authToken) {
        setRecentBookingsError(
          "Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.",
        );
        setRecentBookingsLoading(false);
        return;
      }

      try {
        setRecentBookingsLoading(true);
        setRecentBookingsError("");

        const response = await fetch(
          "http://localhost:5000/api/admin/bookings/recent",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
          throw new Error(
            data.message || "Không thể tải danh sách đơn đặt vé gần đây.",
          );
        }

        setRecentBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Recent bookings API error:", error);
          setRecentBookingsError(
            error.message || "Không thể kết nối đến máy chủ.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setRecentBookingsLoading(false);
        }
      }
    };

    fetchRecentBookings();

    return () => controller.abort();
  }, [authToken]);

  // Lấy tất cả đơn đặt vé
  useEffect(() => {
    const controller = new AbortController();

    const fetchAllBookings = async () => {
      if (!authToken) {
        setBookingsError(
          "Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.",
        );
        setBookingsLoading(false);
        return;
      }

      try {
        setBookingsLoading(true);
        setBookingsError("");

        const response = await fetch(
          "http://localhost:5000/api/admin/bookings",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
          throw new Error(
            data.message || "Không thể tải danh sách đơn đặt vé.",
          );
        }

        const apiBookings = Array.isArray(data.bookings) ? data.bookings : [];

        const normalizedBookings = apiBookings.map((b) => {
          const origin = b.origin || "";
          const destination = b.destination || "";

          const trip =
            b.trip ||
            (origin && destination
              ? `${origin} → ${destination}`
              : "Chưa có thông tin tuyến");

          const createdDate = b.createdAt || b.created_at;

          let formattedDate = "—";

          if (createdDate) {
            const parsedDate = new Date(createdDate);

            formattedDate = !Number.isNaN(parsedDate.getTime())
              ? parsedDate.toLocaleDateString("vi-VN")
              : String(createdDate);
          }

          return {
            id: b.id,
            code: b.bookingCode || "",
            customer: b.customerName || "",
            phone: b.customerPhone || "",
            trip,
            seats:
              b.seats ||
              (b.totalSeats ? `${b.totalSeats} ghế` : "Chưa có thông tin"),
            amount: Number(b.totalAmount || 0),
            status: b.status,
            date: formattedDate,
          };
        });

        setBookings(normalizedBookings);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("All bookings API error:", error);
          setBookingsError(error.message || "Không thể kết nối đến máy chủ.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setBookingsLoading(false);
        }
      }
    };

    fetchAllBookings();

    return () => controller.abort();
  }, [authToken]);

  const section =
    navItems.find((item) => item.id === active)?.label || "Tổng quan";

  const search = query.trim().toLowerCase();

  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        [u.name, u.email, u.phone, roleName(u.role)]
          .join(" ")
          .toLowerCase()
          .includes(search),
      ),
    [users, search],
  );

  const filteredTrips = useMemo(
    () =>
      trips.filter((t) =>
        [t.route, t.bus, t.driver, statusName(t.status)]
          .join(" ")
          .toLowerCase()
          .includes(search),
      ),
    [trips, search],
  );

  const filteredBookings = useMemo(
    () =>
      bookings.filter((b) =>
        [b.code, b.customer, b.phone, b.trip, b.seats]
          .join(" ")
          .toLowerCase()
          .includes(search),
      ),
    [bookings, search],
  );

  // Tìm kiếm giao dịch thanh toán
  const filteredPayments = useMemo(
    () =>
      payments.filter((p) =>
        [
          p.code,
          p.booking,
          p.customer,
          p.phone,
          p.method,
          p.route,
          statusName(p.status),
        ]
          .join(" ")
          .toLowerCase()
          .includes(search),
      ),
    [payments, search],
  );

  // Tìm kiếm xe
  const filteredBuses = useMemo(
    () =>
      buses.filter((b) =>
        [b.plate, b.type, statusName(b.status)]
          .join(" ")
          .toLowerCase()
          .includes(search),
      ),
    [buses, search],
  );

  // Cập nhật trạng thái xe trong MySQL
  const updateBus = async (id, status) => {
    if (!authToken) {
      setNotice("Không tìm thấy token. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setUpdatingBusId(id);
      setNotice("");

      const response = await fetch(
        `http://localhost:5000/api/admin/buses/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Không thể cập nhật trạng thái xe.");
      }

      setBuses((list) =>
        list.map((bus) => (bus.id === id ? { ...bus, status } : bus)),
      );

      setNotice(data.message || "Cập nhật trạng thái xe thành công.");
    } catch (error) {
      console.error("Update bus status error:", error);
      setNotice(error.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setUpdatingBusId(null);
    }
  };

  // Khóa / mở khóa tài khoản bằng API Backend
  const toggleUser = async (id) => {
    const selectedUser = users.find((u) => u.id === id);

    if (!selectedUser || selectedUser.role === "ADMIN") {
      return;
    }

    if (!authToken) {
      setNotice("Không tìm thấy token. Vui lòng đăng nhập lại.");
      return;
    }

    const newActive = !selectedUser.active;

    try {
      setUpdatingUserId(id);
      setNotice("");

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: newActive,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(
          data.message || "Không thể cập nhật trạng thái tài khoản.",
        );
      }

      setUsers((list) =>
        list.map((u) => (u.id === id ? { ...u, active: newActive } : u)),
      );

      setNotice(
        newActive
          ? `Đã mở khóa tài khoản ${selectedUser.name}.`
          : `Đã khóa tài khoản ${selectedUser.name}.`,
      );
    } catch (error) {
      console.error("Update user status error:", error);
      setNotice(error.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Cập nhật trạng thái chuyến xe trong MySQL thông qua Backend
  const updateTrip = async (id, status) => {
    if (!authToken) {
      setNotice("Không tìm thấy token. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setUpdatingTripId(id);
      setNotice("");

      const response = await fetch(
        `http://localhost:5000/api/admin/trips/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(
          data.message || "Không thể cập nhật trạng thái chuyến xe.",
        );
      }

      setTrips((list) =>
        list.map((trip) =>
          trip.id === id
            ? { ...trip, status: data.trip?.status || status }
            : trip,
        ),
      );

      setNotice(data.message || "Đã cập nhật trạng thái chuyến xe thành công.");
    } catch (error) {
      console.error("Update trip status error:", error);
      setNotice(error.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setUpdatingTripId(null);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-emerald-950">
          <Bus className="h-6 w-6" />
        </div>

        <div>
          <p className="text-lg font-black tracking-tight text-white">EcoBus</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
            Admin Console
          </p>
        </div>
      </div>

      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Quản lý hệ thống
        </p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id);
                  setQuery("");
                  setMobileOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  active === item.id
                    ? "bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-950/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 p-4">
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 font-black text-emerald-950">
            {(user?.fullName || "A").charAt(0)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {user?.fullName || "Quản trị viên"}
            </p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </>
  );

  const TableWrap = ({ children }) => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );

  const Empty = ({ text }) => (
    <div className="p-10 text-center text-sm text-slate-500">{text}</div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {mobileOpen && (
        <button
          aria-label="Đóng menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-950 transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-xs font-semibold text-slate-400">
                EcoBus / Quản trị
              </p>
              <h1 className="text-xl font-black text-slate-900">{section}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 sm:flex">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Quyền quản trị
            </div>

            <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>

            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800 sm:flex">
              {(user?.fullName || "A").charAt(0)}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 md:p-8">
          {notice && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              <span>{notice}</span>

              <button onClick={() => setNotice("")}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {active !== "overview" && (
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">{section}</h2>

                <p className="text-sm text-slate-500">
                  Theo dõi và quản lý dữ liệu {section.toLowerCase()} của
                  EcoBus.
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          )}

          {active === "overview" && (
            <>
              <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Xin chào, {user?.fullName || "Quản trị viên"} 👋
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                    Tổng quan hệ thống
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Tình hình hoạt động của nền tảng đặt vé xe.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                  <CalendarDays className="h-4 w-4" />
                  {new Date().toLocaleDateString("vi-VN", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboardError && (
                  <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="font-semibold">
                      Không thể tải dữ liệu Dashboard
                    </div>
                    <div className="mt-1">{dashboardError}</div>
                  </div>
                )}

                <StatCard
                  title="Tổng tài khoản"
                  value={
                    dashboardLoading
                      ? "Đang tải..."
                      : dashboardError
                        ? "—"
                        : (overview?.totalUsers ?? 0)
                  }
                  note={
                    dashboardLoading
                      ? "Đang lấy dữ liệu..."
                      : dashboardError
                        ? "Không thể tải dữ liệu"
                        : `${overview?.totalDrivers ?? 0} tài xế`
                  }
                  icon={Users}
                />

                <StatCard
                  title="Chuyến xe"
                  value={
                    dashboardLoading
                      ? "Đang tải..."
                      : dashboardError
                        ? "—"
                        : (overview?.totalTrips ?? 0)
                  }
                  note={
                    dashboardLoading
                      ? "Đang lấy dữ liệu..."
                      : dashboardError
                        ? "Không thể tải dữ liệu"
                        : `${overview?.scheduledTrips ?? 0} chuyến đã lên lịch`
                  }
                  icon={Bus}
                />

                <StatCard
                  title="Đơn đặt vé"
                  value={
                    dashboardLoading
                      ? "Đang tải..."
                      : dashboardError
                        ? "—"
                        : (overview?.totalBookings ?? 0)
                  }
                  note={
                    dashboardLoading
                      ? "Đang lấy dữ liệu..."
                      : dashboardError
                        ? "Không thể tải dữ liệu"
                        : `${overview?.confirmedBookings ?? 0} đơn đã xác nhận`
                  }
                  icon={Ticket}
                />

                <StatCard
                  title="Doanh thu đã ghi nhận"
                  value={
                    dashboardLoading
                      ? "Đang tải..."
                      : dashboardError
                        ? "—"
                        : money(overview?.totalRevenue ?? 0)
                  }
                  note={
                    dashboardLoading
                      ? "Đang lấy dữ liệu..."
                      : dashboardError
                        ? "Không thể tải dữ liệu"
                        : `${overview?.successfulPayments ?? 0} giao dịch thành công`
                  }
                  icon={Wallet}
                />

                {/* BIỂU ĐỒ THỐNG KÊ */}
                <div className="col-span-full mt-6 space-y-5">
                  {dashboardLoading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                      Đang tải dữ liệu biểu đồ...
                    </div>
                  ) : dashboardError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                      Không thể tải dữ liệu biểu đồ.
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5">
                          <h3 className="text-lg font-bold text-slate-900">
                            Doanh thu 6 tháng gần nhất
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Thống kê doanh thu từ các giao dịch thành công
                          </p>
                        </div>

                        <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData.monthlyData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                              />
                              <XAxis dataKey="label" />
                              <YAxis
                                tickFormatter={(value) =>
                                  `${(value / 1000000).toFixed(1)}tr`
                                }
                              />
                              <Tooltip
                                formatter={(value) => [
                                  money(value),
                                  "Doanh thu",
                                ]}
                                labelFormatter={(label) =>
                                  `Tháng ${label.replace("T", "")}`
                                }
                              />
                              <Line
                                type="monotone"
                                dataKey="revenue"
                                name="Doanh thu"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                activeDot={{ r: 7 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="mb-5">
                            <h3 className="text-lg font-bold text-slate-900">
                              Số lượng đặt vé
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Số đơn đặt vé trong 6 tháng gần nhất
                            </p>
                          </div>

                          <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData.monthlyData}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip
                                  formatter={(value) => [
                                    `${value} đơn`,
                                    "Số lượng đặt vé",
                                  ]}
                                  labelFormatter={(label) =>
                                    `Tháng ${label.replace("T", "")}`
                                  }
                                />
                                <Bar
                                  dataKey="totalBookings"
                                  name="Số đơn"
                                  fill="#6366F1"
                                  radius={[6, 6, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="mb-5">
                            <h3 className="text-lg font-bold text-slate-900">
                              Phân bổ tài khoản
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Tỷ lệ tài khoản theo vai trò
                            </p>
                          </div>

                          <div className="h-72 w-full">
                            {chartData.userData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={chartData.userData}
                                    dataKey="total"
                                    nameKey="role"
                                    cx="50%"
                                    cy="45%"
                                    outerRadius={90}
                                    label={({ role, percent }) =>
                                      `${role} ${(percent * 100).toFixed(0)}%`
                                    }
                                  >
                                    {chartData.userData.map((entry, index) => (
                                      <Cell
                                        key={`role-${entry.role}`}
                                        fill={
                                          roleColors[index % roleColors.length]
                                        }
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    formatter={(value) => [
                                      `${value} tài khoản`,
                                      "Số lượng",
                                    ]}
                                  />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                Chưa có dữ liệu tài khoản
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5">
                          <h3 className="text-lg font-bold text-slate-900">
                            Tuyến xe phổ biến
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Top 5 tuyến có số lượt đặt vé cao nhất
                          </p>
                        </div>

                        {chartData.routeData.length > 0 ? (
                          <div
                            className="w-full"
                            style={{
                              height: Math.max(
                                260,
                                chartData.routeData.length * 65,
                              ),
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={chartData.routeData}
                                layout="vertical"
                                margin={{ left: 15, right: 30 }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  horizontal={false}
                                />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis
                                  type="category"
                                  dataKey="route"
                                  width={220}
                                  tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                  formatter={(value) => [
                                    `${value} lượt`,
                                    "Số lượt đặt vé",
                                  ]}
                                />
                                <Bar
                                  dataKey="totalBookings"
                                  name="Lượt đặt vé"
                                  fill="#F59E0B"
                                  radius={[0, 6, 6, 0]}
                                  barSize={28}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="py-12 text-center text-sm text-slate-400">
                            Chưa có dữ liệu tuyến xe
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-900">
                        Đơn đặt vé gần đây
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        5 đơn đặt vé mới nhất từ cơ sở dữ liệu
                      </p>
                    </div>

                    <button
                      onClick={() => setActive("bookings")}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      Xem tất cả <ArrowUpRight className="inline h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="text-xs uppercase text-slate-400">
                        <tr>
                          <th className="pb-3 font-semibold">Mã đặt vé</th>
                          <th className="pb-3 font-semibold">Khách hàng</th>
                          <th className="pb-3 font-semibold">Tổng tiền</th>
                          <th className="pb-3 font-semibold">Trạng thái</th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentBookingsLoading ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="border-t border-slate-100 py-8 text-center text-slate-400"
                            >
                              Đang tải đơn đặt vé...
                            </td>
                          </tr>
                        ) : recentBookingsError ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="border-t border-slate-100 py-8 text-center text-rose-500"
                            >
                              {recentBookingsError}
                            </td>
                          </tr>
                        ) : recentBookings.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="border-t border-slate-100 py-8 text-center text-slate-400"
                            >
                              Chưa có đơn đặt vé nào.
                            </td>
                          </tr>
                        ) : (
                          recentBookings.map((b) => (
                            <tr
                              key={b.id}
                              className="border-t border-slate-100"
                            >
                              <td className="py-3 font-bold text-slate-800">
                                {b.bookingCode || b.code}
                              </td>
                              <td className="py-3 text-slate-600">
                                {b.customerName || b.customer}
                              </td>
                              <td className="py-3 font-bold">
                                {money(b.totalAmount ?? b.amount)}
                              </td>
                              <td className="py-3">
                                <Status value={b.status} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-black text-slate-900">
                    Tình trạng hệ thống
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Tổng hợp nhanh từ cơ sở dữ liệu
                  </p>

                  <div className="mt-5 space-y-4">
                    {[
                      {
                        label: "Tài xế đang hoạt động",
                        value: overview?.activeDrivers ?? 0,
                        total: overview?.totalDrivers ?? 0,
                        color: "bg-emerald-500",
                      },
                      {
                        label: "Chuyến đã lên lịch",
                        value: overview?.scheduledTrips ?? 0,
                        total: overview?.totalTrips ?? 0,
                        color: "bg-blue-500",
                      },
                      {
                        label: "Đơn đã xác nhận",
                        value: overview?.confirmedBookings ?? 0,
                        total: overview?.totalBookings ?? 0,
                        color: "bg-violet-500",
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="font-semibold text-slate-600">
                            {item.label}
                          </span>
                          <span className="font-bold text-slate-900">
                            {dashboardLoading
                              ? "Đang tải..."
                              : dashboardError
                                ? "—"
                                : `${item.value}/${item.total}`}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{
                              width:
                                !dashboardLoading &&
                                !dashboardError &&
                                item.total
                                  ? `${(item.value / item.total) * 100}%`
                                  : "0%",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {/* QUẢN LÝ TÀI KHOẢN */}
          {active === "users" && (
            <TableWrap>
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    {[
                      "Tài khoản",
                      "Liên hệ",
                      "Vai trò",
                      "Trạng thái",
                      "Thao tác",
                    ].map((h) => (
                      <th key={h} className="px-5 py-4 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {usersLoading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-10 text-center text-slate-400"
                      >
                        Đang tải danh sách tài khoản...
                      </td>
                    </tr>
                  ) : usersError ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-10 text-center text-rose-500"
                      >
                        {usersError}
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-10 text-center text-slate-400"
                      >
                        Không tìm thấy tài khoản phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="border-t border-slate-100">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {u.phone || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold">
                            {roleName(u.role)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <Status value={u.active ? "ACTIVE" : "INACTIVE"} />
                        </td>

                        <td className="px-5 py-4">
                          <button
                            disabled={
                              u.role === "ADMIN" || updatingUserId === u.id
                            }
                            onClick={() => toggleUser(u.id)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {updatingUserId === u.id
                              ? "Đang cập nhật..."
                              : u.role === "ADMIN"
                                ? "Quản trị viên"
                                : u.active
                                  ? "Khóa tài khoản"
                                  : "Mở khóa"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TableWrap>
          )}

          {/* QUẢN LÝ CHUYẾN XE */}
          {active === "trips" && (
            <TableWrap>
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    {[
                      "Tuyến đường",
                      "Xe",
                      "Tài xế",
                      "Khởi hành",
                      "Giá vé",
                      "Trạng thái",
                      "Thao tác",
                    ].map((h) => (
                      <th key={h} className="px-5 py-4 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {tripsLoading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-10 text-center text-slate-400"
                      >
                        Đang tải danh sách chuyến xe...
                      </td>
                    </tr>
                  ) : tripsError ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-10 text-center text-rose-500"
                      >
                        {tripsError}
                      </td>
                    </tr>
                  ) : filteredTrips.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-10 text-center text-slate-400"
                      >
                        Không tìm thấy chuyến xe phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredTrips.map((t) => (
                      <tr key={t.id} className="border-t border-slate-100">
                        <td className="px-5 py-4 font-bold">{t.route}</td>
                        <td className="px-5 py-4">{t.bus}</td>
                        <td className="px-5 py-4">{t.driver}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {t.departure}
                        </td>
                        <td className="px-5 py-4 font-bold">
                          {money(t.price)}
                        </td>
                        <td className="px-5 py-4">
                          <Status value={t.status} />
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={t.status}
                            disabled={updatingTripId === t.id}
                            onChange={(e) => updateTrip(t.id, e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs disabled:cursor-wait disabled:opacity-50"
                          >
                            <option value="SCHEDULED">SCHEDULED</option>
                            <option value="DEPARTED">DEPARTED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                          {updatingTripId === t.id && (
                            <p className="mt-1 text-xs text-slate-400">
                              Đang cập nhật...
                            </p>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TableWrap>
          )}

          {/* QUẢN LÝ ĐẶT VÉ */}
          {active === "bookings" && (
            <TableWrap>
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    {[
                      "Mã đặt vé",
                      "Khách hàng",
                      "Tuyến",
                      "Ghế",
                      "Tổng tiền",
                      "Ngày đặt",
                      "Trạng thái",
                      "Thao tác",
                    ].map((h) => (
                      <th key={h} className="px-5 py-4 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {bookingsLoading ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-5 py-8 text-center text-slate-400"
                      >
                        Đang tải dữ liệu đơn đặt vé...
                      </td>
                    </tr>
                  ) : bookingsError ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-5 py-8 text-center text-rose-500"
                      >
                        {bookingsError}
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-5 py-8 text-center text-slate-400"
                      >
                        Không tìm thấy đơn đặt vé phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="border-t border-slate-100">
                        <td className="px-5 py-4 font-bold">{b.code}</td>

                        <td className="px-5 py-4">
                          <p className="font-semibold">{b.customer}</p>
                          <p className="text-xs text-slate-500">{b.phone}</p>
                        </td>

                        <td className="px-5 py-4">{b.trip}</td>
                        <td className="px-5 py-4">{b.seats}</td>

                        <td className="px-5 py-4 font-bold">
                          {money(b.amount)}
                        </td>

                        <td className="px-5 py-4 text-slate-600">{b.date}</td>

                        <td className="px-5 py-4">
                          <Status value={b.status} />
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={b.status}
                            disabled
                            title="Chưa có API cập nhật trạng thái"
                            className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs text-slate-400"
                          >
                            <option value={b.status}>
                              {statusName(b.status)}
                            </option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TableWrap>
          )}

          {/* QUẢN LÝ THANH TOÁN */}
          {active === "payments" && (
            <TableWrap>
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    {[
                      "Mã giao dịch",
                      "Mã đặt vé",
                      "Khách hàng",
                      "Phương thức",
                      "Số tiền",
                      "Ngày thanh toán",
                      "Trạng thái",
                    ].map((h) => (
                      <th key={h} className="px-5 py-4 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paymentsLoading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-10 text-center text-slate-400"
                      >
                        Đang tải danh sách giao dịch...
                      </td>
                    </tr>
                  ) : paymentsError ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-10 text-center text-rose-500"
                      >
                        {paymentsError}
                      </td>
                    </tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-10 text-center text-slate-400"
                      >
                        Không tìm thấy giao dịch thanh toán phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="border-t border-slate-100">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{p.code}</p>
                          <p className="text-xs text-slate-400">ID: {p.id}</p>
                        </td>

                        <td className="px-5 py-4 font-semibold">{p.booking}</td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {p.customer}
                          </p>
                          <p className="text-xs text-slate-500">{p.phone}</p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold">
                            {p.method}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-900">
                          {money(p.amount)}
                        </td>

                        <td className="px-5 py-4 text-slate-600">{p.date}</td>

                        <td className="px-5 py-4">
                          <Status value={p.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TableWrap>
          )}

          {/* QUẢN LÝ XE */}
          {active === "buses" && (
            <div className="space-y-5">
              {/* Thống kê nhanh */}
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  title="Tổng số xe"
                  value={busesLoading ? "..." : buses.length}
                  note="Xe trong hệ thống"
                  icon={Bus}
                />

                <StatCard
                  title="Đang hoạt động"
                  value={
                    busesLoading
                      ? "..."
                      : buses.filter((b) => b.status === "ACTIVE").length
                  }
                  note="Sẵn sàng phục vụ"
                  icon={CircleCheck}
                  tone="blue"
                />

                <StatCard
                  title="Đang bảo trì"
                  value={
                    busesLoading
                      ? "..."
                      : buses.filter((b) => b.status === "MAINTENANCE").length
                  }
                  note="Tạm ngừng hoạt động"
                  icon={MapPinned}
                  tone="amber"
                />
              </div>

              <TableWrap>
                <table className="w-full min-w-[950px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      {[
                        "Biển số xe",
                        "Loại xe",
                        "Số tầng",
                        "Số chỗ",
                        "Số chuyến",
                        "Trạng thái",
                        "Thao tác",
                      ].map((h) => (
                        <th key={h} className="px-5 py-4 font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {busesLoading ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-5 py-10 text-center text-slate-400"
                        >
                          Đang tải danh sách xe...
                        </td>
                      </tr>
                    ) : busesError ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-5 py-10 text-center text-rose-500"
                        >
                          {busesError}
                        </td>
                      </tr>
                    ) : filteredBuses.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-5 py-10 text-center text-slate-400"
                        >
                          Không tìm thấy xe phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredBuses.map((b) => (
                        <tr key={b.id} className="border-t border-slate-100">
                          <td className="px-5 py-4 font-bold text-slate-900">
                            {b.plate}
                          </td>

                          <td className="px-5 py-4">
                            {{
                              SEAT: "Ghế ngồi",
                              SLEEPER: "Giường nằm",
                              LIMOUSINE: "Limousine",
                            }[b.type] || b.type}
                          </td>

                          <td className="px-5 py-4">{b.floorCount} tầng</td>

                          <td className="px-5 py-4">{b.seats} chỗ</td>

                          <td className="px-5 py-4">{b.totalTrips} chuyến</td>

                          <td className="px-5 py-4">
                            <Status value={b.status} />
                          </td>

                          <td className="px-5 py-4">
                            <select
                              value={b.status}
                              disabled={updatingBusId === b.id}
                              onChange={(e) => updateBus(b.id, e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs disabled:cursor-wait disabled:opacity-50"
                            >
                              <option value="ACTIVE">Hoạt động</option>
                              <option value="MAINTENANCE">Bảo trì</option>
                            </select>

                            {updatingBusId === b.id && (
                              <p className="mt-1 text-xs text-slate-400">
                                Đang cập nhật...
                              </p>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TableWrap>
            </div>
          )}

          <p className="mt-5 text-xs text-slate-400"></p>
        </main>
      </div>
    </div>
  );
}
