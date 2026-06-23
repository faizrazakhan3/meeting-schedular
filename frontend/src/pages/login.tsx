import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { styles } from "../theme/styles";
import bgImage from "../assests/images.jpg";
import toast from "react-hot-toast";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {

    if (!email.trim()) {
      toast.error("Please enter email");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter password");
      return;
    }

    const response = await fetch(
      "https://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

   if (data.token) {
  localStorage.setItem(
    "token",
    data.token
  );

  localStorage.setItem(
    "user",
    JSON.stringify(data.user)
  );

  toast.success("Login Success");

  navigate("/dashboard");
  return;
}

    toast.error(data.message);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="min-h-screen bg-black/50 flex flex-col items-center justify-center px-4 py-6">

        <h1 className={`${styles.title} mb-10`}>
          Meeting Organizer
        </h1>

        <div className={styles.card}>

          <p className={styles.subtitle}>
            Login to continue
          </p>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter Email"
            className={styles.input}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter Password"
            className={styles.input}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className={styles.button}
          >
            Login
          </button>

          <p className="text-center mt-4 text-lg">
            Don't have an account?{" "}
            <Link
              to="/register"
              className={styles.link}
            >
              Register
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}

export default Login;