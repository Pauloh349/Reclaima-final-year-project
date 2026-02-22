export default function MatchCard({
  image,
  title,
  category,
  location,
  date,
  confidence = 0,
  status,
}) {
  const confidenceClass = confidence >= 90 ? "high" : "medium";

  return (
    <article className="match-card">
      <div className="match-image">
        <img src={image} alt={title} />
        <span className={`confidence-pill ${confidenceClass}`}>
          {confidence}% Match
        </span>
      </div>

      <div className="match-body">
        <h3>{title}</h3>
        <p className="match-category">{category}</p>

        <div className="match-meta">
          <span className="material-icons">location_on</span>
          <span>{location}</span>
        </div>

        <div className="match-meta">
          <span className="material-icons">event</span>
          <span>{date}</span>
        </div>

        <p className="match-status">{status}</p>

        <div className="match-actions">
          <button className="match-btn solid">View Item</button>
          <button className="match-btn">Message Finder</button>
        </div>
      </div>
    </article>
  );
}
