import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./index.css";
import "./styles.css";

import {
  Footer,
  Blog,
  Possibility,
  Features,
  WhatGPT3,
  Header,
} from "./container"; //container imports from index.js

import { CTA, Brand, Navbar } from "./components"; //import of components from index.js

import Login from "./components/Login";
import Home from "./container/Home";

const app = () => {
  return (
    <div classNam="app">
      <div className="gradient__bg">
        <Navbar />
        <Header />
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="/*" element={<Home />} />
        </Routes>
      </div>
      <Brand />
      <WhatGPT3 />
      <Features />
      <Possibility />
      <CTA />
      <Blog />
      <Footer />
    </div>
  );
};

export default app;
