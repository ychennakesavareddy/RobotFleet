// src/RobotDetails.js

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function RobotDetails() {
  const { id } = useParams();
  const [robot, setRobot] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/robots/${id}`)
      .then((response) => {
        setRobot(response.data);
      })
      .catch((error) => console.error("Error fetching robot details: ", error));
  }, [id]);

  if (!robot) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Robot {robot["Robot ID"]}</h1>
      <p>Status: {robot["Online/Offline"] ? "Online" : "Offline"}</p>
      <p>Battery Level: {robot["Battery Percentage"]}%</p>
      <p>CPU Usage: {robot["CPU Usage"]}%</p>
      <p>RAM Consumption: {robot["RAM Consumption"]} MB</p>
      <p>Last Updated: {robot["Last Updated"]}</p>
    </div>
  );
}

export default RobotDetails;
