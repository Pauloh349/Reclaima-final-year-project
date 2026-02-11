import "../styles/ProfileSettings.css";
import {
  Content,
  ProfileFooter,
  ProfileNavbar,
  Sidebar,
} from "../components/profile/ProfileSections";

export default function ProfileSettings() {
  return (
    <div className="profile-page">
      <ProfileNavbar />

      <main className="main">
        <div className="layout">
          <Sidebar />
          <Content />
        </div>
      </main>

      <ProfileFooter />
    </div>
  );
}
