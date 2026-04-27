import placeholderImage from "../../assets/default-image.png";

function MatchCard({
  itemId,
  image,
  title,
  category,
  location,
  date,
  confidence = 0,
  status,
  onViewItem,
  onMessageFinder,
}) {
  const confidenceClass = confidence >= 90 ? "high" : "medium";
  const imageSrc = image || placeholderImage;
  const imageClass = image ? "" : "is-placeholder";

  return (
    <article className="match-card">
      <div className="match-image">
        <img src={imageSrc} alt={title} className={imageClass} />
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
          <button
            type="button"
            className="match-btn solid"
            onClick={onViewItem}
            disabled={!itemId || !onViewItem}
          >
            View Item
          </button>
          <button type="button" className="match-btn" onClick={onMessageFinder}>
            Message Finder
          </button>
        </div>
      </div>
    </article>
  );
}

export default MatchCard;
export { MatchCard };
