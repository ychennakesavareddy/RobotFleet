import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import fakeRobotData from "./fake_robot_data"; // Import initial robots data
import "leaflet/dist/leaflet.css";
import "./App.css";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Robot icon for the map marker
const robotIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
});

// Helper functions for battery and CPU symbols
const getBatteryIcon = (batteryPercentage) => {
  if (batteryPercentage >= 90) {
    return "🔋"; // Full battery symbol
  } else if (batteryPercentage >= 20) {
    return "🔋"; // Half battery symbol
  } else {
    return "⚡"; // Low battery symbol
  }
};

const getCpuIcon = () => {
  return "💻"; // CPU symbol
};

const getRamIcon = () => {
  return "🖥️"; // RAM icon
};

const generateRandomCoordinate = () => {
  // Generating random coordinates on different continents
  const continents = [
    { name: "Africa", latRange: [-35, 37], lonRange: [-20, 55] },
    { name: "Asia", latRange: [10, 80], lonRange: [60, 170] },
    { name: "North America", latRange: [15, 85], lonRange: [-170, -60] },
    { name: "South America", latRange: [-60, 15], lonRange: [-80, -35] },
    { name: "Europe", latRange: [35, 72], lonRange: [-30, 60] },
    { name: "Australia", latRange: [-50, -10], lonRange: [113, 154] },
  ];

  const continent = continents[Math.floor(Math.random() * continents.length)];
  const lat = Math.random() * (continent.latRange[1] - continent.latRange[0]) + continent.latRange[0];
  const lon = Math.random() * (continent.lonRange[1] - continent.lonRange[0]) + continent.lonRange[0];
  
  return [lat, lon];
};

const App = () => {
  const [robots, setRobots] = useState(fakeRobotData); // Initialize with 100 robots
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);

  // Update robot data periodically
  useEffect(() => {
    const updateStatusInterval = setInterval(() => {
      setRobots((prevRobots) =>
        prevRobots.map((robot) => ({
          ...robot,
          "Online/Offline": Math.random() > 0.5, // Randomly toggle status
        }))
      );
    }, 10000); // Update status every 10 seconds

    const updateDataInterval = setInterval(() => {
      setRobots((prevRobots) =>
        prevRobots.map((robot) => ({
          ...robot,
          "Battery Percentage": Math.max(1, Math.floor(Math.random() * 100)), // Randomize battery percentage
          "CPU Usage": Math.floor(Math.random() * 100), // Randomize CPU usage
          "RAM Consumption": Math.floor(Math.random() * 8000), // Randomize RAM consumption
          "Last Updated": new Date().toISOString(), // Update timestamp
          "Latitude": generateRandomCoordinate()[0],
          "Longitude": generateRandomCoordinate()[1],
        }))
      );
    }, 5000); // Update battery, CPU, RAM, and location every 5 seconds

    return () => {
      clearInterval(updateStatusInterval);
      clearInterval(updateDataInterval);
    };
  }, []);

  // Update online and offline counts
  useEffect(() => {
    const online = robots.filter((robot) => robot["Online/Offline"]).length;
    const offline = robots.length - online;
    setOnlineCount(online);
    setOfflineCount(offline);
  }, [robots]);

  // Pie chart data
  const pieChartData = {
    labels: ["Online", "Offline"],
    datasets: [
      {
        data: [onlineCount, offlineCount],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  // Pie chart options
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  // Bar chart data for online/offline count
  const barChartData = {
    labels: ["Online", "Offline"],
    datasets: [
      {
        label: "Robot Status",
        data: [onlineCount, offlineCount],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // This makes the bar chart fit within its container
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Maximum value for the y-axis to ensure the bar chart range is 100
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  // Handle back button click
  const handleBackToList = () => {
    setSelectedRobot(null);
  };

  // Handle "View Location" button click
  const handleViewLocationClick = (robot) => {
    setSelectedRobot(robot);
  };

  // Determine the robot's border color based on battery and status
  const getBorderClass = (robot) => {
    if (robot["Battery Percentage"] < 20) {
      return "low-battery";
    }
    return robot["Online/Offline"] ? "online" : "offline";
  };

  // Get valid latitude and longitude or fallback to default
  const getLatLng = (robot) => {
    if (robot && robot["Latitude"] && robot["Longitude"]) {
      return [robot["Latitude"], robot["Longitude"]];
    }
    return [51.505, -0.09]; // Default to a known valid location (e.g., London)
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Robot Fleet Dashboard</h1>
      </header>

      {!selectedRobot ? (
        <div className="dashboard-container">
          <div className="chart-container">
            <div className="pie-chart">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
            <div className="bar-chart">
              <div className="status-counts">
                <div className="status-count">
                  <span>Online: {onlineCount}</span>
                </div>
                <div className="status-count">
                  <span>Offline: {offlineCount}</span>
                </div>
              </div>
              <div className="bar-chart-container">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>
          </div>

          <div className="robot-list">
            {robots.length > 0 ? (
              robots.map((robot) => (
                <div
                  key={robot["Robot ID"]}
                  className={`robot-card ${getBorderClass(robot)}`}
                >
                  <h3>Robot ID: {robot["Robot ID"]}</h3>
                  <p
                    className={`status-${robot["Online/Offline"] ? "online" : "offline"}`}
                  >
                    Status: {robot["Online/Offline"] ? "Online" : "Offline"}
                  </p>

                  <div className="battery-cpu-info">
                    <p>
                      <span className="battery-icon">
                        {getBatteryIcon(robot["Battery Percentage"])}
                      </span>
                      Battery: {robot["Battery Percentage"]}%
                    </p>
                    <p>
                      <span className="cpu-icon">{getCpuIcon()}</span> CPU Usage: {robot["CPU Usage"]}%
                    </p>
                    <p>
                      <span className="ram-icon">{getRamIcon()}</span> RAM Consumption: {robot["RAM Consumption"]}MB
                    </p>
                  </div>

                  <button
                    className="view-location-button"
                    onClick={() => handleViewLocationClick(robot)}
                  >
                    View Location
                  </button>
                </div>
              ))
            ) : (
              <p>No robots found.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="map-container">
          <div className="robot-details">
            <button
              className="back-button"
              onClick={handleBackToList}
            >
              Back to Robot List
            </button>
            <h3>Robot Details</h3>
            <p>Robot ID: {selectedRobot["Robot ID"]}</p>
            <p>Status: {selectedRobot["Online/Offline"] ? "Online" : "Offline"}</p>
            <p>
              Battery: {selectedRobot["Battery Percentage"]}% <span className="battery-icon">{getBatteryIcon(selectedRobot["Battery Percentage"])}</span>
            </p>
            <p>CPU Usage: {selectedRobot["CPU Usage"]}%</p>
            <p>RAM: {selectedRobot["RAM Consumption"]}MB</p>
            <p>Last Updated: {selectedRobot["Last Updated"]}</p>
          </div>

          <div className="robot-map-container">
            <MapContainer center={getLatLng(selectedRobot)} zoom={13} style={{ height: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={getLatLng(selectedRobot)} icon={robotIcon}>
                <Popup>
                  <strong>Robot ID:</strong> {selectedRobot["Robot ID"]}<br />
                  <strong>Status:</strong> {selectedRobot["Online/Offline"] ? "Online" : "Offline"}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
