import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar.jsx";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      <div className="content-area">
        <div className="topbar">
          <span className="brand-mark">
            <span className="brand-dot" />
            ATS Copilot
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list" />
          </button>
        </div>

        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
