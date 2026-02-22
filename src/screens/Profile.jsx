import "../styles/ProfileSettings.css";
import {
  Content,
  ProfileFooter,
  ProfileNavbar,
} from "../components/profile/ProfileSections";

export default function ProfileSettings() {
  return (
    <div className="profile-page">
      <ProfileNavbar />

      <main className="main">
        <Content />
      </main>

      <ProfileFooter />
    </div>
  );
}
