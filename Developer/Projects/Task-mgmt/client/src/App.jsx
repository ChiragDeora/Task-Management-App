import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./Dashboard";

const App = () => (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<Dashboard />} />
    </Route>
  </Routes>
);

export default App;
