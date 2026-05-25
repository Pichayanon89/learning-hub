import { BarChart3 } from 'lucide-react';

export default function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <BarChart3 size={22} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
