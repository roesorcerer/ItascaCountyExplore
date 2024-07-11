import React, { useEffect, useState } from "react";
import "./quests.css";

/**MUI links */
import { duration, styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import AspectRatio from "@mui/joy/AspectRatio";
import Favorite from "@mui/icons-material/Favorite";
import { Link } from "react-router-dom";
import Divider from "@mui/joy/Divider";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Button } from "@mui/material";
import { fetchLocations, urlFor } from "../../client";

/**I want the cards to have a modal popup instead of the Expand more it needs to be replaced */
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

/**function to fetch locations from Sanity */
const Quests = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const getLocations = async () => {
      const data = await fetchLocations();
      setLocations(data);
    };
    getLocations();
  }, []);

  return (
    <div>
      <h2 className="fw-bold display-2">Title for page goes here</h2>
      {locations.map((location) => (
        <Card key={location._id} sx={{ width: 345, marginBottom: 2 }}>
          <CardHeader title={location.title} subheader={location.Location} />
          <CardMedia
            component="img"
            sx={{ height: 250 }}
            image={urlFor(location.Image).url()}
            alt={location.Title}
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {location.Description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Check in to solve</Button>
            <Button size="small">Hint</Button>
          </CardActions>
        </Card>
      ))}
    </div>
  );
};

export default Quests;
