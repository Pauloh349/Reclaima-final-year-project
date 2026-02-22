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

export function MiniCard({ title, imageSrc }) {
  return (
    <div className="mini-card">
      <img src={imageSrc} alt={title} />
      <strong>{title}</strong>
      <small>Found recently</small>
    </div>
  );
}
