import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [loginVal,    setLoginVal]    = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  const fromRegister = (location.state as { fromRegister?: boolean } | null)?.fromRegister;

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(loginVal, password);
    if (result.ok) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="auth-card"
      >
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "#E8A020" }}
          >
            <span style={{
              fontFamily: "'Barlow Condensed', system-ui, sans-serif",
              fontWeight: 700, fontSize: "1rem", color: "#0E0E10", letterSpacing: "0.02em",
            }}>AT</span>
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', system-ui, sans-serif",
            fontWeight: 700, fontSize: "1.3rem", color: "#EFEFEF", letterSpacing: "0.06em",
          }}>
            AL-TACADAO
          </h1>
          <p style={{ fontSize: "0.68rem", color: "#3C3C44", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.2rem" }}>
            Management System
          </p>
        </div>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#EFEFEF", marginBottom: "0.25rem" }}>
          Welcome back
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#52525B", marginBottom: "1.5rem" }}>
          Sign in to your account to continue
        </p>

        {fromRegister && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-success mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
            Account created — sign in to continue.
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-error mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#E5484D" }} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#3C3C44" }} />
              <input
                className="input-field pl-9"
                placeholder="your.username"
                value={loginVal}
                onChange={(e) => setLoginVal(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#3C3C44" }} />
              <input
                className="input-field pl-9 pr-10"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#3C3C44" }}
              >
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !loginVal || !password}
            className="btn btn-primary w-full mt-2"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(14,14,16,0.3)", borderTopColor: "#0E0E10" }} />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign in <ArrowRight size={14} />
              </span>
            )}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center" style={{ fontSize: "0.875rem", color: "#52525B" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="transition-colors font-semibold"
            style={{ color: "#E8A020" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F0AB28")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#E8A020")}
          >
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
