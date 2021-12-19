import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import App from "./App";
import Signup from "./auth/Signup";
import Signin from "./auth/Signin";
import Activate from "./auth/Activate";
import Private from "./core/Private";
import PrivateRoute from "./auth/PrivateRoute";
import Admin from "./core/Admin";
import AdminRoute from "./auth/AdminRoute";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={App}></Route>
        <Route path="/signin" exact component={Signin}></Route>
        <Route path="/signup" exact component={Signup}></Route>
        <Route path="/auth/activate/:token" exact component={Activate}></Route>
        <PrivateRoute path="/private" exact component={Private}></PrivateRoute>
        <AdminRoute path="/admin" exact component={Admin}></AdminRoute>
        <Route
          path="/auth/password/forgot"
          exact
          component={ForgotPassword}
        ></Route>
        <Route
          path="/auth/password/reset/:token"
          exact
          component={ResetPassword}
        ></Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
