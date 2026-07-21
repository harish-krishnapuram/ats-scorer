import { NavLink } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "bi-grid-1x2" },
  { to: "/resumes", label: "Resumes", icon: "bi-file-earmark-text" },
  { to: "/jobs", label: "Job Descriptions", icon: "bi-briefcase" },
  { to: "/analysis", label: "Run Analysis", icon: "bi-graph-up-arrow" },
  { to: "/history", label: "History", icon: "bi-clock-history" },
];

function initials(name, email) {
  const source = (name || email || "?").trim();
  const parts = source.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function Sidebar({ open, onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onNavigate} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">
            <span className="brand-dot" />
            ATS Copilot
          </span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              onClick={onNavigate}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-avatar">{initials(user?.full_name, user?.email)}</span>
            <div className="overflow-hidden">
              <div className="sidebar-user-name">{user?.full_name || "Your account"}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button type="button" className="btn btn-outline-light btn-sm w-100" onClick={logout}>
            <i className="bi bi-box-arrow-right me-1" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
