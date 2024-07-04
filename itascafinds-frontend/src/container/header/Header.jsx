import React from "react";
import "./header.css";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import people from "../../assets/people.png";
import heroimg from "../../assets/heroimg.png";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "transparent",
  boxShadow: "none",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  justifyContent: "center",
  alignItems: "center",
}));

const Header = () => {
  return (
    /** Come back and change the box sizes to make it all align properly */
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={6}>
        <Grid item xs={6} md={7} sx={{ height: "100px" }}>
          <Item>
            <div className="itascafinds__header-content">
              <h1 className="gradient__text">
                Take on quests. Climb the leaderboard and get to know the space
                around you.{" "}
              </h1>
            </div>
          </Item>
        </Grid>
        <Grid item xs={6} md={4}>
          <Item>
            {" "}
            <img src={heroimg} alt="header" />
          </Item>
        </Grid>
        <Grid item xs={6} md={10}>
          <Item>
            {" "}
            <div className="itascafinds__header-content">
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
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Header;
