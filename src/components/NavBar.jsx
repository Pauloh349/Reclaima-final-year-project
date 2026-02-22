import { Link } from "react-router-dom";
import "../styles/NavBar.css";

function NavLinkItem({ item }) {
  if (item.kind === "divider") {
    return <span className="rc-navbar-divider" aria-hidden="true" />;
  }

  const className = `rc-navbar-link ${item.active ? "is-active" : ""} ${
    item.className || ""
  }`.trim();

  if (item.to) {
    return (
      <Link to={item.to} className={className}>
        {item.label}
      </Link>
    );
  }

  return (
    <a href={item.href || "#"} className={className}>
      {item.label}
    </a>
  );
}

export default function NavBar({
  icon = "search",
  logoText = "Reclaima",
  logoTo = "/",
  links = [],
  rightContent = null,
  className = "",
  innerClassName = "",
  fixed = false,
}) {
  return (
    <nav className={`rc-navbar ${fixed ? "rc-navbar-fixed" : ""} ${className}`}>
      <div className={`rc-navbar-inner ${innerClassName}`}>
        <Link to={logoTo} className="rc-navbar-brand">
          <div className="rc-navbar-logo-icon">
            <span className="material-icons">{icon}</span>
          </div>
          <span className="rc-navbar-logo-text">{logoText}</span>
        </Link>

        {links.length > 0 && (
          <div className="rc-navbar-links">
            {links.map((item, index) => (
              <NavLinkItem key={`${item.label || item.kind || "item"}-${index}`} item={item} />
            ))}
          </div>
        )}

        {rightContent ? <div className="rc-navbar-right">{rightContent}</div> : null}
      </div>
    </nav>
  );
}
