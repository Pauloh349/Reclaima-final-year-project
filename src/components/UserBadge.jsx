import { Link } from "react-router-dom";
import { getUserDisplayName, useAuthUser } from "../hooks/useAuthUser";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC-a4k-dzglr3WR5xOMK6lpSWTCp2cum41llRNSt_XpifFfqGpXcCh5EpqdAkZUHfeYrKWHRPeHCmW5TFCBIRM9T9zvvJqVydGPOdxSSjfjj1qdvI4RT6XR6DkcxS7mfTShf2LR1kfnCNCvjSK3-CyLptvg1roEw5V5ORXfKXaGu4dLI41oWrUkba2SYToworuTgrE1IidJPnW3qy7Bj3nIzLquvr-9nbnXeFY2Ps-rAUKoS9StOkheJEwpiiNLqWD0NBcjwHEkTYUy";

export default function UserBadge({
  avatarSrc = DEFAULT_AVATAR,
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
