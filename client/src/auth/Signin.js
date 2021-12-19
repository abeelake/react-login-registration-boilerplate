import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { authenticate, isAuth } from "./helpers";
const Signin = ({ history }) => {
  // useState for userData
  const [values, setValues] = useState({
    email: "laaaamo@gmail.com",
    password: "asdfghjkl",
    buttonText: "Submit",
  });

  // destructure variables inside values
  const { email, password, buttonText } = values;

  const changeHandler = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: "Submitting" });
    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/signin`,
      data: { email, password },
    })
      .then((res) => {
        console.log("signin success!", res);

        // save response (user, token) in localstorage and cookie
        // cleanup state variable

        // save the user and token to local and cookie
        authenticate(res, () => {
          setValues({
            ...values,
            email: "",
            password: "",
            buttonText: "Submitted",
          });
        });
        // toast.success(`Hey ${res.data.user.name}, Welcome back!`);
        isAuth() && isAuth().role === "admin"
          ? history.push("/admin")
          : history.push("/private");
      })
      .catch((err) => {
        console.log("Signin error", err.response.data);
        setValues({ ...values, buttonText: "Submit" });
        toast.error(err.response.data.err);
      });
  };

  const signInForm = () => (
    <form action="">
      <div className="form-group">
        <input
          type="email"
          onChange={changeHandler("email")}
          value={email}
          placeholder="email here..."
          className="form-control"
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          onChange={changeHandler("password")}
          value={password}
          placeholder="password here..."
          className="form-control"
        />
      </div>

      <div>
        <button className="btn btn-primary" onClick={submitHandler}>
          {buttonText}
        </button>
      </div>
    </form>
  );

  return (
    <Layout>
      <ToastContainer />
      {isAuth() ? <Redirect to="/" /> : null}
      <div className="col-md-6 offset-md-3">
        <h1 className="p-5 text-center">Signin</h1>
        {signInForm()}
      </div>
    </Layout>
  );
};

export default Signin;
