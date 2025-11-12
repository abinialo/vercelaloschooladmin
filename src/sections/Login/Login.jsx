import React, { use, useEffect } from "react";
import schoolLogo from "../../assets/loginPage_image/AloSchoolredesign_logo.png";
import schoolImg from "../../assets/loginPage_image/AloSchoolboy_image.png";
import styles from "./Login.module.css";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LoginUser } from '../../api/Serviceapi';
import { message } from "antd";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../component/loader/Loader";

const Login = ({ setLoginUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    userName: "",
    passWord: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState([]);

  const navigate = useNavigate();

  function Validation() {
    let newErrors = {}
    if (!email.trim()) {
      newErrors.userName = "Email Id is required";
      setError(prev => ({ ...prev, userName: newErrors.userName }));

    } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email.trim())) {

      newErrors.userName = " enter a valid email address";
      setError(prev => ({ ...prev, userName: newErrors.userName }));
    }

    if (!password.trim()) {
      newErrors.password = " Password is Required";
      setError(prev => ({ ...prev, passWord: newErrors.password }))

    }
    return newErrors
  }
  const [loading, setLoading] = useState(false);
  const handleClick = async (e) => {
    e.preventDefault();

    let validation = Validation();

    if (Object.keys(validation).length === 0) {
      setLoading(true)
      try {
        const res = await LoginUser(email, password);
        console.log('hkokoioj')
        if (res?.data?.data?.data.role == "admin") {

          setUser(res?.data);

          let token = res?.data?.data.token;
          let userId = res?.data?.data?.data.userId;
          let userName = res?.data?.data?.data.name;
          localStorage.setItem('authToken', token);
          sessionStorage.setItem('authToken', token);
          localStorage.setItem('userId', userId);
          sessionStorage.setItem('userId', userId);
          localStorage.setItem('username', userName);

          setLoginUser(true);
          navigate("/dashboard");

        }
        console.log(user)
      } catch (err) {
        console.error("Login failed:", err);
        toast.error(err?.response?.data?.message)
      }finally{
        setLoading(false)
      }
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
              <form action="" onSubmit={(e) => handleClick(e)}>
                {/* Username Field */}
                <div className={styles.formDivName}>
                  <label htmlFor="username">Email ID</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Email ID"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                  />
                  <p className={styles.errorMsg}>{error.userName}</p>
                </div>

                {/* Password Field */}
                <div className={styles.formDivPass}>
                  <label htmlFor="password">Password</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);

                        setError("");
                      }}
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


                {/* <p>{message}</p> */}

                {/* Submit Button */}
                <div className={styles.formDivBtn}>
                  <button type="submit">{loading?'Signing in...':"Sign in"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>


      </div>
      <ToastContainer />

    </>
  );
};

export default Login;
