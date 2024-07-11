import React from "react";
import { Routes, Route } from "react-router-dom";
import "./index.css";
import "./styles.css";

import {
  Footer,
  Quests,
  HowItWorks,
  Leaderboard,
  Header,
  SuggestLocation,
} from "./container"; //container imports from index.js

import { CTA, Updates } from "./components"; //import of components from index.js

import Login from "./components/Login";
import Layout from "./container/Layout"; // Adjust path if needed

const App = () => {
  return (
    <div className="app">
      <Routes>
        {/**Route for the home page - this is all the components needed for this */}
        <Route
          path="/"
          element={
            <Layout>
              <Header />
              <CTA />
              <Updates />

              <Footer />
            </Layout>
          }
        />

        {/**Route for how it works page */}
        <Route
          path="/howitworks"
          element={
            <Layout>
              <HowItWorks />
            </Layout>
          }
        />
        {/**Route for Suggest Location Page */}
        <Route
          path="/suggestlocation"
          element={
            <Layout>
              <SuggestLocation />
            </Layout>
          }
        />

        {/**Route for Suggest Location Page */}
        <Route
          path="/leaderboard"
          element={
            <Layout>
              <Leaderboard />
            </Layout>
          }
        />

        {/**Route for Quest Locations */}
        <Route
          path="/quests"
          element={
            <Layout>
              <Quests />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <Header />
              <CTA />
              <Updates />
            </Layout>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
