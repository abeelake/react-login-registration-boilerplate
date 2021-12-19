import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { isAuth } from "./helpers";

const Signup = () => {
  // useState for userData
  const [values, setValues] = useState({
    name: "Abhilekh",
    email: "laaaamo@gmail.com",
    password: "asdfghjkl",
    buttonText: "Submit",
  });

  // destructure variables inside values
  const { name, email, password, buttonText } = values;

  const changeHandler = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: "Submitting" });
    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/signup`,
      data: { name, email, password },
    })
      .then((res) => {
        console.log("signup success!", res);
        // cleanup state variable
        setValues({
          ...values,
          name: "",
          email: "",
          password: "",
          buttonText: "Submitted",
        });
        toast.success(res.data.message);
      })
      .catch((err) => {
        console.log("Signup error", err.response.data);
        setValues({ ...values, buttonText: "Submit" });
        toast.error(err.response.data.error);
      });
  };

  const signUpForm = () => (
    <form action="">
      <div className="form-group">
        <input
          type="text"
          onChange={changeHandler("name")}
          value={name}
          placeholder="name here..."
          className="form-control"
        />
      </div>
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
        <h1 className="p-5 text-center">Signup</h1>
        {signUpForm()}
      </div>
    </Layout>
  );
};

export default Signup;
