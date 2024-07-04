import React from "react";
import "./suggestlocation.css";

/**MUI Styles */
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardContent from "@mui/joy/CardContent";
import Checkbox from "@mui/joy/Checkbox";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CreditCardIcon from "@mui/icons-material/CreditCard";
const SuggestLocation = () => {
  return (
    <div style={{ padding: "20px" }}>
      Suggest Location
      {/**Card for form input to submit a new location. Where do these inputs go? Saved and stored to display on the backend.... */}
      <Card
        variant="outlined"
        sx={{
          maxHeight: "max-content",
          maxWidth: "100%",
          mx: "auto",
          // to make the demo resizable
          overflow: "auto",
          resize: "horizontal",
        }}
      >
        <Typography level="title-lg" startDecorator={<FmdGoodIcon />}>
          Submit Location Details
        </Typography>
        <Divider inset="none" />
        <CardContent
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(80px, 1fr))",
            gap: 1.5,
          }}
        >
          <FormControl sx={{ gridColumn: "1/-1" }}>
            <FormLabel>Location Name</FormLabel>
            <Input endDecorator={<CreditCardIcon />} />
          </FormControl>
          <FormControl>
            <FormLabel>Type in Address of Location here </FormLabel>
            <Input endDecorator={<CreditCardIcon />} />
          </FormControl>
          <FormControl>
            <FormLabel>Give me a few brief words on the location....</FormLabel>
            <Input endDecorator={<FmdGoodIcon />} />
          </FormControl>
          <FormControl sx={{ gridColumn: "1/-1" }}>
            <FormLabel>
              Can you tell me about the history of the location to help with the
              riddle?
            </FormLabel>
            <Input placeholder="Can you describe the area?" />
          </FormControl>

          <CardActions sx={{ gridColumn: "1/-1" }}>
            <Button variant="solid" color="primary">
              Submit Location
            </Button>
          </CardActions>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestLocation;
