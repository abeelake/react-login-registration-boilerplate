import React, { useState } from "react";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const ResetPassword = ({ match }) => {
  // props.match.params
  // useState for userData
  const [values, setValues] = useState({
    name: "",
    buttonText: "Reset Password",
  });

  // destructure variables inside values
  const { email, buttonText } = values;

  const changeHandler = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: "Submitting" });
    console.log("send req");
    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API}/forgot-password`,
      data: { email },
    })
      .then((res) => {
        console.log("forgot password success!", res);
        toast.success(`${res.data.message}`);
        setValues({ ...values, buttonText: "Requested" });
      })
      .catch((err) => {
        console.log("Forgot Password Error- ", err.response.data.error);
        setValues({ ...values, buttonText: "Request Password Reset Link" });
        toast.error(err.response.data.error);
      });
  };

  const resetPasswordForm = () => (
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

      <div className="col-md-6 offset-md-3">
        <h1 className="p-5 text-center">Reset Password</h1>
        {resetPasswordForm()}
      </div>
    </Layout>
  );
};

export default ResetPassword;
