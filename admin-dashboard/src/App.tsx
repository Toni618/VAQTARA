import { Routes, Route, Link } from 'react-router-dom'

function Placeholder({ title, note }: { title: string; note?: string }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{note || 'Scaffold placeholder — functional implementation pending.'}</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h1>RAVENDORA Admin</h1>
        <p className="muted">v1.0.0 scaffold</p>
        <nav>
          <Link to="/">Overview</Link>
          <Link to="/users">Users</Link>
          <Link to="/subscriptions">Subscriptions</Link>
          <Link to="/payments">Payments</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/security">Security & Audit</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Placeholder title="Dashboard Overview" note="Will show users, trials, subscriptions, health, and alerts." />} />
          <Route path="/users" element={<Placeholder title="User Management" note="Search, status, suspend/activate, sessions — pending backend admin APIs." />} />
          <Route path="/subscriptions" element={<Placeholder title="Subscriptions & Trials" note="Plans, pricing, trial config, subscription states — pending." />} />
          <Route path="/payments" element={<Placeholder title="Payments" note="Payment records, verification status, refunds — pending." />} />
          <Route path="/analytics" element={<Placeholder title="Analytics" note="Platform metrics and operational reports — pending." />} />
          <Route path="/security" element={<Placeholder title="Security Events & Audit" note="Audit logs, login/session events, admin actions — pending." />} />
          <Route path="/settings" element={<Placeholder title="System Settings" note="Announcements, feature flags, versions, support — pending." />} />
        </Routes>
      </main>
    </div>
  )
}
