import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/HowItWorks.css";

const steps = [
  {
    icon: "edit_note",
    title: "Post a Lost or Found Report",
    description:
      "Add item details, where it was seen, and photos if available. Clear reports improve matching speed.",
  },
  {
    icon: "auto_awesome",
    title: "Get Smart Matches",
    description:
      "Reclaima compares reports by category, time, and location to suggest the most likely matches.",
  },
  {
    icon: "forum",
    title: "Chat and Verify",
    description:
      "Use in-app chat to confirm item details safely without exposing sensitive information publicly.",
  },
  {
    icon: "handshake",
    title: "Return Securely",
    description:
      "Meet in approved public campus spots or hand over at campus security for a safe return.",
  },
];

export default function HowItWorks() {
  return (
    <div className="how-page">
      <NavBar
        icon="help"
        links={[
          { label: "Home", to: "/" },
          { label: "How it works", to: "/how-it-works", active: true },
          { label: "Help Center", to: "/help" },
        ]}
        rightContent={
          <>
            <Link to="/signin" className="how-link-btn">
              Sign In
            </Link>
            <Link to="/signup" className="how-cta">
              Get Started
            </Link>
          </>
        }
      />

      <main className="how-container">
        <section className="how-hero">
          <span className="how-eyebrow">How Reclaima Works</span>
          <h1>From lost to found in four practical steps</h1>
          <p>
            Reclaima helps students and staff report items, receive smart
            matches, and coordinate safe returns inside the university
            community.
          </p>
        </section>

        <section className="how-steps">
          {steps.map((step, index) => (
            <article key={step.title} className="how-step-card">
              <div className="how-step-top">
                <div className="how-step-icon">
                  <span className="material-icons">{step.icon}</span>
                </div>
                <span className="how-step-number">Step {index + 1}</span>
              </div>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </article>
          ))}
        </section>

        <section className="how-note">
          <span className="material-icons">verified_user</span>
          <p>
            Safety first: always verify ownership and prefer public handover
            points like libraries, student centers, or security desks.
          </p>
        </section>
      </main>
    </div>
  );
}
