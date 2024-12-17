import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [robots, setRobots] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/robots')
      .then(response => {
        setRobots(response.data);
      })
      .catch(error => console.error("Error fetching data: ", error));
  }, []);

  return (
    <div>
      <h1>Robot Fleet Dashboard</h1>
      <ul>
        {robots.map(robot => (
          <li key={robot.id}>{robot.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
