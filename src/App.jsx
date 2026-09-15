import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { SignOut } from "@phosphor-icons/react";
import CommandPalette from "./components/CommandPalette.jsx";
import Logo from "./components/Logo.jsx";
import { useAuth } from "./context/AuthContext.jsx";

// Ventriloc header: wordmark kiri, pill nav tengah, CTA gelap kanan.
const NAV = [
  { to: "/runs", label: "Runs", end: true },
  { to: "/runs/new", label: "New run", end: false },
  { to: "/compare", label: "Compare", end: false },
  { to: "/templates", label: "Templates", end: false },
  { to: "/workflow", label: "Workflow", end: false },
];

export default function App() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-canvas-white text-graphite font-inter">
      <header className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-5">
        <Link
          to="/runs"
          className="shrink-0 rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
        >
          <Logo />
        </Link>
        <nav
          aria-label="Navigasi utama"
          className="bg-ash rounded-[200px] px-[18px] py-2 flex items-center gap-5 order-3 w-full justify-start overflow-x-auto sm:order-none sm:w-auto sm:justify-center"
        >
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `font-polysans text-[16px] tracking-[-0.02em] whitespace-nowrap rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange ${
                  isActive ? "text-graphite" : "text-slate hover:text-graphite"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={handleLogout}
            className="font-polysans text-[16px] tracking-[-0.02em] text-slate hover:text-graphite inline-flex items-center gap-1.5 rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
          >
            <SignOut size={16} weight="bold" aria-hidden /> Keluar
          </button>
          <Link
            to="/runs/new"
            className="font-polysans text-[14px] sm:text-[16px] tracking-[-0.02em] bg-graphite text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-none hover:bg-steel transition-colors active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-orange"
          >
            New run
          </Link>
        </div>
      </header>
      <main className="max-w-[1200px] mx-auto px-5 pb-20">
        <Outlet />
      </main>
      <CommandPalette />
      <footer className="max-w-[1200px] mx-auto px-5 pb-10">
        <p className="font-polysans text-[13px] text-slate">AutoQA · Visual QA · Playwright · No DOM</p>
      </footer>
    </div>
  );
}
