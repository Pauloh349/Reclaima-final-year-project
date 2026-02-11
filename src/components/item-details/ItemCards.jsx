export function DetailRow({ icon, label, value }) {
  return (
    <div className="detail-row">
      <span className="material-icons">{icon}</span>
      <div>
        <small>{label}</small>
        <p>{value}</p>
      </div>
    </div>
  );
}

export function MiniCard({ title }) {
  return (
    <div className="mini-card">
      <img src="https://via.placeholder.com/200" alt={title} />
      <strong>{title}</strong>
      <small>Found recently</small>
    </div>
  );
}
