import "../styles/NotFound.css";

const NotFound = () => {
  return (
    <div className="notfound-page" role="main">
      <div className="notfound-icon" aria-hidden="true">
        <span>404</span>
      </div>
      <h1>Page not found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
    </div>
  );
};

export default NotFound;
