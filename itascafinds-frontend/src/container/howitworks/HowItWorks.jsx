import React from "react";
import "./howitworks.css";

/** Mui imports */
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/system";
import AspectRatio from "@mui/joy/AspectRatio";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardOverflow from "@mui/joy/CardOverflow";
import CardCover from "@mui/joy/CardCover";
import Button from "@mui/joy/Button";

// Create styled components using @mui/system
const StyledDiv = styled("div")(({ theme }) => ({
  padding: theme.spacing(2.5),
}));

const HowItWorks = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1 class="text-4xl font-bold text-center text-gray-800 mt-8">
        Find out how to take on quests
      </h1>
      <p class="text-center text-lg text-gray-600 mt-4">more info</p>

      {/**FAQ card for heading  */}
      <Card
        size="lg"
        variant="plain"
        orientation="horizontal"
        sx={{
          textAlign: "center",
          maxWidth: "100%",
          width: 500,
          // to make the demo resizable
          resize: "horizontal",
          overflow: "auto",
        }}
      >
        <CardOverflow
          variant="solid"
          color="primary"
          sx={{
            flex: "0 0 200px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: "var(--Card-padding)",
          }}
        >
          <Typography fontSize="xl4" fontWeight="xl" textColor="#fff">
            89
          </Typography>
          <Typography textColor="primary.200">
            FAQs answered, see if yours is one of them.
          </Typography>
        </CardOverflow>
        <CardContent sx={{ gap: 1.5, minWidth: 200 }}>
          <AspectRatio ratio="19/8" objectFit="contain" variant="plain">
            <img
              alt=""
              src="https://static.vecteezy.com/system/resources/previews/006/409/485/original/people-thinking-to-make-decision-problem-solving-and-find-creative-ideas-with-question-mark-in-flat-cartoon-background-for-poster-illustration-vector.jpg"
            />
          </AspectRatio>
          <CardContent>
            <Typography level="title-lg">Need Some Help?</Typography>
            <Typography fontSize="sm" sx={{ mt: 0.5 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor.
            </Typography>
          </CardContent>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              "--variant-borderWidth": "2px",
              borderRadius: 40,
              borderColor: "primary.500",
              mx: "auto",
            }}
          >
            See FAQ
          </Button>
        </CardContent>
      </Card>
      {/** First accordion stays open*/}
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1=header"
        >
          <Typography>How does this site work?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            To help people explore the area around them and encourage people to
            find cool new places in Itasca County.
          </Typography>
        </AccordionDetails>
      </Accordion>
      {/**Card for quick information  */}
      <Card orientation="horizontal" variant="outlined" sx={{ width: 260 }}>
        <CardOverflow>
          <AspectRatio ratio="1" sx={{ width: 90 }}>
            <img
              src="https://images.unsplash.com/photo-1507833423370-a126b89d394b?auto=format&fit=crop&w=90"
              srcSet="https://images.unsplash.com/photo-1507833423370-a126b89d394b?auto=format&fit=crop&w=90&dpr=2 2x"
              loading="lazy"
              alt=""
            />
          </AspectRatio>
        </CardOverflow>
        <CardContent>
          <Typography fontWeight="md" textColor="success.plainColor">
            Yosemite Park
          </Typography>
          <Typography level="body-sm">California, USA</Typography>
        </CardContent>
        <CardOverflow
          variant="soft"
          color="primary"
          sx={{
            px: 0.2,
            writingMode: "vertical-rl",
            justifyContent: "center",
            fontSize: "xs",
            fontWeight: "xl",
            letterSpacing: "1px",
            textTransform: "uppercase",
            borderLeft: "1px solid",
            borderColor: "divider",
          }}
        >
          Ticket
        </CardOverflow>
      </Card>
      {/** Second accordion stays closed*/}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography>Why Itasca County.</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Because it's local to me. I live in a small town and I want to show
            some love to the beauty of my little community. If you know where to
            look you can find so much cool stuff, and kindness in the simple
            stuff.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default HowItWorks;
