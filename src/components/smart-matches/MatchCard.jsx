export default function MatchCard({
  image,
  title,
  location,
  date,
  confidence,
  high,
}) {
  return (
    <div className="match-card">
      <div className="image-wrapper">
        <img src={image} alt={title} />
        <span className={`badge ${high ? "high" : "medium"}`}>
          {confidence}
        </span>
      </div>

      <div className="card-body">
        <h3>{title}</h3>

        <div className="meta">
          <span className="material-icons">location_on</span>
          <span>{location}</span>
        </div>

        <div className="meta">
          <span className="material-icons">event</span>
          <span>{date}</span>
        </div>

        <button className="primary-btn">
          View Details
          <span className="material-icons small">open_in_new</span>
        </button>
      </div>
    </div>
  );
}
