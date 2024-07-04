import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    try {
      await axios.post("http://localhost:3000/login", { email, password });
      alert("Login Successful!");
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Login failed!");
    }
  }

  return (
    <div className="mt-4 flex-grow items-center justify-around">
      <div className="mt-48">
        <h1 className="text-4xl text-center">Login</h1>
        <form className="max-w-2xl mx-auto" onSubmit={handleLoginSubmit}>
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
          <button className="primary">Login</button>
          <div className="text-center py-2 text-borderColor">
            Don't have an account yet?
            <Link to="/register" className="underline font-bold">
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
