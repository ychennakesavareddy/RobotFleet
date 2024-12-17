from flask import Flask, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
import json
import random
import time
from datetime import datetime

# Point Flask's static folder to React's build folder
app = Flask(__name__, static_folder="../reactapp/build", static_url_path="/")
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})
socketio = SocketIO(app, cors_allowed_origins="*")

robot_data_file = r'C:\Users\yenug\OneDrive\Desktop\project\RobotFleetDashboard\fake_robot_data.json'

def load_robot_data():
    with open(robot_data_file, 'r') as file:
        return json.load(file)

robots = load_robot_data()

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/robots', methods=['GET'])
def get_robots():
    return jsonify(robots)

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    socketio.emit('robot_data', robots)

def update_robot_data():
    while True:
        time.sleep(5)  # Every 5 seconds
        for robot in robots:
            robot["Battery Percentage"] = random.randint(0, 100)
            robot["CPU Usage"] = random.randint(0, 100)
            robot["RAM Consumption"] = random.randint(1000, 8000)  # Random RAM usage
            robot["Last Updated"] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Timestamp for when data was last updated

            # Ensure location is present (if not, assign a random location for testing)
            if "Location Coordinates" not in robot:
                robot["Location Coordinates"] = [random.uniform(50, 60), random.uniform(-1, 1)]  # Random location for testing

        socketio.emit('robot_data', robots)

if __name__ == '__main__':
    socketio.start_background_task(update_robot_data)
    socketio.run(app, host='0.0.0.0', port=5000)
