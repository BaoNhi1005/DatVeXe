import React, { useState } from "react";
import { X, Lock, Mail, Phone, User, LogIn, UserPlus } from "lucide-react";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu!");
      return;
    }

    if (isRegister) {
      if (!fullName || !phone) {
        alert("Vui lòng điền đầy đủ thông tin đăng ký!");
        return;
      }

      // Tam thoi giu dang ky Customer
      onLoginSuccess({
        id: 4,
        fullName,
        email,
        phone,
        role: "CUSTOMER",
      });

      onClose();
      return;
    }

    // Dang nhap Admin bang API that
    if (email.trim().toLowerCase() === "admin@vexere.com") {
      setLoading(true);

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/admin/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email.trim(),
              password,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Đăng nhập thất bại!");
          return;
        }

        onLoginSuccess({
          id: data.admin.id,
          fullName: data.admin.fullName,
          email: data.admin.email,
          role: "ADMIN",
          token: data.token,
        });

        onClose();
      } catch (error) {
        console.error("Admin login error:", error);
        alert("Không thể kết nối đến máy chủ!");
      } finally {
        setLoading(false);
      }

      return;
    }

    // Tam thoi giu dang nhap Customer va Driver
    const isDriver = email.toLowerCase().includes("driver");

    onLoginSuccess({
      id: isDriver ? 2 : 4,
      fullName: isDriver ? "Trần Văn Lái" : "Hoàng Khách Hàng",
      email,
      phone: isDriver ? "0902000001" : "0903000001",
      role: isDriver ? "DRIVER" : "CUSTOMER",
    });

    onClose();
  };

  // Dang nhap nhanh Customer va Driver
  const handleQuickLogin = (role) => {
    if (role === "CUSTOMER") {
      onLoginSuccess({
        id: 4,
        fullName: "Hoàng Khách Hàng",
        email: "khachhang@gmail.com",
        phone: "0903000001",
        role: "CUSTOMER",
      });
    } else if (role === "DRIVER") {
      onLoginSuccess({
        id: 2,
        fullName: "Trần Văn Lái (Tài xế)",
        email: "driver1@vexere.com",
        phone: "0902000001",
        role: "DRIVER",
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-900 to-emerald-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-xl font-black tracking-tight">
            {isRegister ? "Đăng Ký Tài Khoản EcoBus" : "Đăng Nhập Hệ Thống"}
          </h3>

          <p className="text-xs text-brand-200 mt-1">
            {isRegister
              ? "Tạo tài khoản để quản lý vé và nhận ưu đãi độc quyền"
              : "Vui lòng đăng nhập để tiếp tục đặt vé xe và quản lý vé"}
          </p>
        </div>

        <div className="flex border-b border-slate-100 text-sm font-bold bg-slate-50">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-3 text-center transition-all ${
              !isRegister
                ? "bg-white text-brand-700 border-b-2 border-brand-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Đăng nhập
          </button>

          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-3 text-center transition-all ${
              isRegister
                ? "bg-white text-brand-700 border-b-2 border-brand-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Đăng ký mới
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Họ và tên *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Số điện thoại *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-medium"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Địa chỉ Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Mật khẩu *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all mt-2 active:scale-95 disabled:opacity-60"
          >
            {isRegister ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}

            <span>
              {loading
                ? "Đang xử lý..."
                : isRegister
                  ? "Đăng ký tài khoản"
                  : "Đăng nhập ngay"}
            </span>
          </button>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block mb-2 font-medium">
              ⚡ Đăng nhập thử nhanh (Kiểm thử giao diện):
            </span>

            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleQuickLogin("CUSTOMER")}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-brand-200 text-brand-800 font-bold text-xs transition-all"
              >
                Tài khoản Khách hàng
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("DRIVER")}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs transition-all"
              >
                Tài khoản Tài xế
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
