import React from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const Navbar = () => (
  <nav className="navbar">
    <ul>
      <li>
        <Link to="/" className="nav-link">
          Dashboard
        </Link>
      </li>
      <SignedIn>
        <li>
          <Link to="/tasks" className="nav-link">
            Tasks
          </Link>
        </li>
        <li>
          <UserButton />
        </li>
      </SignedIn>
      <SignedOut>
        <li>
          <Link to="/sign-in" className="nav-link">
            Log In
          </Link>
        </li>
      </SignedOut>
    </ul>
  </nav>
);

export default Navbar;
