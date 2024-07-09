import React from "react";
import { Link } from "react-router-dom";

const Homepage = () => {
  return (
    <div className="homepage">
      <h1>Welcome to the Task Management System</h1>
      <Link to="/tasks" className="btn">
        Go to Tasks
      </Link>
    </div>
  );
};

export default Homepage;
