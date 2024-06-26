import React from "react";
import "./header.css";
import people from "../../assets/people.png";
import heroimg from "../../assets/heroimg.png";
const Header = () => {
  return (
    <div className="itascafinds__header section__padding" id="home">
      <div className="itascafinds__header-wrapper">
        <div className="itascafinds__header-content">
          <h1 className="gradient__text">
            Take on quests. Climb the leaderboard and get to know the space
            around you.{" "}
          </h1>
          <p>
            Discover local favorites and see if you can find new locations
            within our beautiful county lines.
          </p>
          <div className="itascafinds__header-content__input">
            <input type="email" placeholder="Your Email Address" />
            <button type="button">Get Started</button>
          </div>

          <div className="itascafinds__header-content__people">
            <img src={people} alt="people" />
            <p>1,600 people have been here!</p>
          </div>
        </div>
        <div className="itascafinds__header-image">
          <img src={heroimg} alt="header" />
        </div>
      </div>
    </div>
  );
};

export default Header;
