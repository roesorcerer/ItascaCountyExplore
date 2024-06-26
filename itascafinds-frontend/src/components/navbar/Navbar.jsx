import React, { useState } from "react";
import "./navbar.css";
import { RiMenu3Line, RiCloseLin, RiCloseLine } from "react-icons/ri";
import logo from "../../assets/IQ_logo.png";

const Menu = () => (
  <>
    <p>
      <a href="#home">Home</a>
    </p>
    <p>
      <a href="#home">How it Works</a>
    </p>
    <p>
      <a href="#home">Suggest Location</a>
    </p>
    <p>
      <a href="#home">Leaderboard</a>
    </p>
  </>
);

// BEM Block Element Modifier for classname naming convention for CSS
const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false); //variable declaration for mobile menu and function to hold action.
  return (
    <nav className="itascafinds__navbar">
      <div className="itascafinds__navbar-links">
        <div className="itascafinds__navbar-links_logo">
          <img src={logo} alt="logo for Itasca Quest" />
        </div>
        <div className="itascafinds__navbar-links_container">
          <Menu />
        </div>
      </div>
      <div className="itascafinds__navbar-sign">
        <p>Sign Up</p>
        <button type="button">Sign In</button>
      </div>
      <div className="itascafinds__navbar-menu">
        {toggleMenu ? (
          <RiCloseLine
            color="#121010"
            size={27}
            onClick={() => setToggleMenu(false)}
          />
        ) : (
          <RiMenu3Line
            color="#121010"
            size={27}
            onClick={() => setToggleMenu(true)}
          />
        )}
        {toggleMenu && (
          <div className="itascafinds__navbar-menu_container scale-up-center">
            <div className="itascafinds__navbar-menu_container-links">
              <Menu />
              <div className="itascafinds__navbar-container-links-sign">
                <p>Sign Up</p>
                <button type="button">Sign In</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
