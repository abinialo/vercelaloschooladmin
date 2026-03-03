import React, { useState } from "react";
import schoolLogo from "../../assets/loginPage_image/AloSchoolredesign_logo.png";
import schoolImg from "../../assets/loginPage_image/AloSchoolboy_image.png";
import styles from "./Login.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LoginUser } from '../../api/Serviceapi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../component/loader/Loader";

const Login = ({ setLoginUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({ userName: "", passWord: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Form validation
  function validateForm() {
    const newErrors = {};
    if (!email.trim()) newErrors.userName = "Email ID is required";
    else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email.trim()))
      newErrors.userName = "Enter a valid email address";

    if (!password.trim()) newErrors.passWord = "Password is required";

    setError(newErrors);
    return newErrors;
  }

  const handleClick = async (e) => {
    e.preventDefault();

    if (Object.keys(validateForm()).length > 0) return;

    setLoading(true);
    try {
      const res = await LoginUser(email, password);
      const userData = res?.data?.data?.data;
      const token = res?.data?.data?.token;

      if (!userData || !token) throw new Error("Invalid login response");

      // Save user data in localStorage and sessionStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", userData.userId);
      localStorage.setItem("username", userData.name);
      localStorage.setItem("userRole", userData.role);

      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("userId", userData.userId);
      sessionStorage.setItem("username", userData.name);
      sessionStorage.setItem("userRole", userData.role);

      setLoginUser(true);

      // Navigate based on role
      if (userData.role === "admin") {
        toast.success("Logged in as Admin!");
        navigate("/dashboard");
      } else if (userData.role === "sub-admin") {
        toast.success("Logged in as Sub Admin!");
        navigate("/alumniimages");
      } else {
        toast.error("Unauthorized role!");
      }

    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err?.response?.data?.message || err.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles["content-left"]}>
            <div className={styles["content-left-in"]}>
              <div className={styles["content-left-img"]}>
                <img src={schoolLogo} alt="School Logo" />
              </div>
              <div className={styles["content-left-main"]}>
                <div className={styles.head}>
                  <h1>Welcome Back!</h1>
                </div>
                <div className={styles.para}>
                  <p>
                    Empowering growth through learning and technology, creating a future driven by knowledge and innovation.
                  </p>
                </div>
              </div>
              <div className={styles["content-left-image"]}>
                <img src={schoolImg} alt="School Boy" />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles["content-right"]}>
            <div className={styles["content-right-formDiv"]}>
              <div className={styles.formDivHead}>
                <h1>Nice to see you again</h1>
              </div>
              <form onSubmit={handleClick}>
                <div className={styles.formDivName}>
                  <label htmlFor="username">Email ID</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Email ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className={styles.errorMsg}>{error.userName}</p>
                </div>

                <div className={styles.formDivPass}>
                  <label htmlFor="password">Password</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.eyeIcon}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  <p className={styles.errorMsg}>{error.passWord}</p>
                </div>

                <div className={styles.formDivBtn}>
                  <button type="submit">{loading ? 'Signing in...' : "Sign in"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      
    </>
  );
};

export default Login;