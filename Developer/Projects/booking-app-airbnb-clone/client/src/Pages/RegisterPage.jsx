import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function registerUser(ev) {
    ev.preventDefault();
    try {
      await axios.post("/register", {
        name,
        email,
        password,
      });
      alert("Registration Successful! Now you can log in.");
    } catch (e) {
      alert("Registration failed. Please try again later.");
    }
  }

  return (
    <div className="mt-4 flex-grow items-center justify-around">
      <div className="mt-48">
        <h1 className="text-4xl text-center">Register</h1>
        <form className="max-w-2xl mx-auto" onSubmit={registerUser}>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
          <button className="primary">Register</button>
          <div className="text-center py-2 text-borderColor">
            Already a Member?
            <Link to={"/login"} className="underline font-bold">
              Login Now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
