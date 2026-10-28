import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  User,
  ShieldCheck,
  Building2,
  Users,
} from "lucide-react";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useOrg } from "../context/OrgContext";
import { homePathFor } from "../utils/permissions";

export default function Login() {
  const { login, isAuthenticated, currentUser } = useAuth();
  const { departments } = useOrg();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  if (isAuthenticated)
    return <Navigate to={homePathFor(currentUser, departments)} replace />;
  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    try {
      const user = login(username, password);
      navigate(homePathFor(user, departments), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your details.");
    }
  };
  const features = [
    [
      ShieldCheck,
      "Access by role",
      "Each user sees only the areas assigned to them.",
    ],
    [
      Building2,
      "Business-wise control",
      "Keep teams and departments organised.",
    ],
    [
      Users,
      "Follow-ups in one place",
      "Track conversations and next steps clearly.",
    ],
  ];
  return (
    <main className="login-shell min-h-screen bg-(--page) p-0 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-screen max-w-6xl overflow-hidden bg-(--surface) shadow-(--shadow-soft) sm:min-h-[calc(100vh-2.5rem)] sm:rounded-3xl lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_0.9fr]">
        <aside className="login-aside relative hidden flex-col justify-between overflow-hidden login-hero p-10 text-on-dark lg:flex xl:p-14">
          <div className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full border border-on-dark/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full border border-on-dark/10" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl brand-tile text-on-primary shadow-sm">
              <Briefcase className="h-5 w-5" />
            </span>
            <div className="font-semibold">
              Lead Manager
              <span className="block text-xs font-normal text-on-hero-muted">
                Multi-business CRM
              </span>
            </div>
          </div>
          <div className="relative my-12">
            <p className="text-sm font-semibold uppercase tracking-[.16em] text-on-hero-muted">
              A clearer way to work
            </p>
            <h1 className="mt-4 max-w-lg text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Never miss a follow-up.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-on-hero-muted">
              Keep business teams, lead activity and follow-up work organised in
              one calm workspace.
            </p>
            <div className="mt-9 space-y-5">
              {features.map(([Icon, title, description]) => (
                <div key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface/10">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-0.5 text-sm text-on-hero-muted">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="relative text-xs text-on-hero-muted">
            Offline demo · Data is stored in your browser
          </p>
        </aside>
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl brand-tile text-on-primary">
                <Briefcase className="h-5 w-5" />
              </span>
              <h1 className="mt-4 text-2xl font-bold text-(--text-strong)">
                Lead Manager
              </h1>
              <p className="mt-1 text-sm text-(--text-muted)">
                Multi-business CRM
              </p>
            </div>
            <p className="text-sm font-semibold text-(--primary)">
              Welcome back
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-(--text-strong)">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-(--text-muted)">
              Use the account details provided by your administrator.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-border bg-danger-soft px-4 py-3 text-sm font-medium text-danger   "
                >
                  {error}
                </div>
              )}
              <div>
                <label
                  htmlFor="login-username"
                  className="mb-1.5 block text-sm font-semibold text-(--text)"
                >
                  Username
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                  <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Your username"
                    className="h-11 w-full rounded-xl border border-(--border) bg-(--surface) pl-10 pr-3 text-sm text-(--text-strong) placeholder:text-(--text-muted) focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 block text-sm font-semibold text-(--text)"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Your password"
                    className="h-11 w-full rounded-xl border border-(--border) bg-(--surface) pl-10 pr-10 text-sm text-(--text-strong) placeholder:text-(--text-muted) focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-(--text-muted) hover:bg-hover-bg hover:text-on-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="h-11 w-full justify-center text-base"
              >
                <LogIn className="h-4 w-4" />
                Sign in
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-(--text-muted) lg:hidden">
              Offline demo · Data is stored in your browser
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
