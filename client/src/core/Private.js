import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import Layout from "../core/Layout";
import axios from "axios";
import { isAuth, getCookie, signout, updateUser } from "../auth/helpers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const Private = ({ history }) => {
  // useState for userData
  const [values, setValues] = useState({
    role: "",
    name: "",
    email: "",
    password: "",
    buttonText: "Submit",
  });

  const token = getCookie("token");

  const loadUserData = () => {
    axios({
      method: "GET",
      url: `${process.env.REACT_APP_API}/user/${isAuth()._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("PRIVATE PROFILE UPDATE", res);
        const { role, name, email } = res.data;
        setValues({ ...values, role, name, email });
      })
      .catch((err) => {
        console.log("PRIVATE PROFILE UPDATE ERROR", err);
        // if token expired
        if (err.response.status === 401) {
          signout(() => {
            history.push("/");
          });
        }
      });
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // destructure variables inside values
  const { role, name, email, password, buttonText } = values;

  const changeHandler = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: "Submitting" });
    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API}/user/update`,
      data: { name, password },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("PRIVATE PROFILE UPDATE SUCCESS!", res);
        updateUser(res, () => {
          setValues({
            ...values,
            buttonText: "Submitted",
          });
          toast.success("Profile updated successfully");
        });
      })
      .catch((err) => {
        console.log("PRIVATE PROFILE UPDATE ERROR!", err.response);
        setValues({ ...values, buttonText: "Submit" });
        toast.error("Profile Update Error");
      });
  };

  const updateForm = () => (
    <form>
      <div className="form-group">
        <label className="text-muted">Role</label>
        <input
          value={role}
          type="text"
          className="form-control"
          placeholder="role here..."
          disabled
        />
      </div>
      <div className="form-group">
        <label className="text-muted">Name</label>
        <input
          onChange={changeHandler("name")}
          value={name}
          type="text"
          className="form-control"
          placeholder="name here..."
        />
      </div>

      <div className="form-group">
        <label className="text-muted">Email</label>
        <input
          value={email}
          type="email"
          className="form-control"
          placeholder="email here..."
          disabled
        />
      </div>

      <div className="form-group">
        <label className="text-muted">Password</label>
        <input
          onChange={changeHandler("password")}
          value={password}
          type="password"
          className="form-control"
          placeholder="password here..."
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
      <div className="col-md-6 offset-md-3">
        <ToastContainer />
        <h1 className="pt-5 text-center">Private</h1>
        <p className="lead text-center">Profile update</p>
        {updateForm()}
      </div>
    </Layout>
  );
};
export default Private;
