import React from "react";
import Navbar from "../components/navbar/Navbar";
import Footer from "../container/footer/Footer";

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
