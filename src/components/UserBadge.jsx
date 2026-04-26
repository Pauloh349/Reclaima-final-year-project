import { Link } from "react-router-dom";
import { getUserDisplayName, useAuthUser } from "../hooks/useAuthUser";
import defaultAvatar from "../assets/user-icon.png";

export default function UserBadge({
  avatarSrc = defaultAvatar,
  showName = true,
  showChevron = false,
  className = "",
}) {
  const user = useAuthUser();
  const displayName = getUserDisplayName(user);

  return (
    <Link className={`rc-navbar-user ${className}`.trim()} to="/profile">
      <img src={avatarSrc} alt="User Avatar" />
      {showName ? <span className="user-name">{displayName}</span> : null}
      {showChevron ? <span className="material-icons">expand_more</span> : null}
    </Link>
  );
}
