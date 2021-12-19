import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import jwt from "jsonwebtoken";
import "react-toastify/dist/ReactToastify.min.css";

const Activate = ({ match }) => {
  // useState for userData
  const [values, setValues] = useState({
    // grab token from router
    name: "",
    token: "",
    show: true,
  });
  // destructure variables inside values
  const { name, token, show } = values;

  useEffect(() => {
    // get token from Routes.js
    let token = match.params.token;
    let { name } = jwt.decode(token);
    // decode token
    if (token) {
      setValues({ ...values, name, token });
    }
    console.log(token);
  }, []);

  const submitHandler = (event) => {
    event.preventDefault();
    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/account-activation`,
      data: { token },
    })
      .then((res) => {
        console.log("ACCOUNT ACTIVATION", res);
        setValues({
          ...values,
          show: false,
        });
        toast.success(res.data.message);
      })
      .catch((err) => {
        console.log("ACCOUNT ACTIVATION error", err.response.data.error);
        toast.error(err.response.data.error);
      });
  };

  const activationLink = () => (
    <div className="text-center">
      <h1 className="p-5">Hey {name}, Ready to activate your account?</h1>
      <button className="btn btn-outline-primary" onClick={submitHandler}>
        Activate Account
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="col-md-6 offset-md-3">
        <ToastContainer />
        {activationLink()}
      </div>
    </Layout>
  );
};

export default Activate;
