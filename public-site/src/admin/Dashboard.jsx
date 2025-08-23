import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Projects from "./Projects";     // CRUD projects
import Certificates from "./Certificates"; // CRUD certificates
import Experiences from "./Experiences";   // CRUD experiences

export default function Dashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: "220px", background: "#111", color: "#fff", padding: "20px" }}>
        <h2>Admin Panel</h2>
        <nav>
          <ul>
            <li><Link to="projects">Projects</Link></li>
            <li><Link to="certificates">Certificates</Link></li>
            <li><Link to="experiences">Experiences</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Halaman CRUD */}
      <main style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route path="projects" element={<Projects />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="experiences" element={<Experiences />} />
          <Route path="*" element={<h2>Silakan pilih menu</h2>} />
        </Routes>
      </main>
    </div>
  );
}
