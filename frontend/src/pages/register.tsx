import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { styles } from "../theme/styles";
import bgImage from "../assests/images.jpg";
import toast from "react-hot-toast";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleRegister = async () => {

    if (name.trim().length < 3) {
      toast.error("Name must be at least 3 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must contain uppercase, lowercase, number and be at least 8 characters long"
      );
      return;
    }

    const response = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    toast.success(data.message);
    if(response.ok){
      navigate("/login");
    }
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
            Create Account
          </p>

          <input
            type="text"
            placeholder="Enter Name"
            className={styles.input}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Enter Email"
            className={styles.input}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            className={styles.input}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleRegister}
            className={styles.button}
          >
            Register
          </button>

          <p className="text-center mt-4 text-lg">
            Already have an account?{" "}
            <Link
              to="/login"
              className={styles.link}
            >
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;