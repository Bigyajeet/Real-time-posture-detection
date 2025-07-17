# Real-time Posture Detection

## Empowering Healthier Habits Through AI-Powered Posture Monitoring

This project aims to provide users with real-time feedback on their posture, fostering healthier habits and supporting effective exercise routines. By leveraging cutting-edge web and AI technologies, the application offers an intuitive and accessible way to monitor and improve body alignment.

## ✨ Key Features

* **Real-time Posture Analysis:** Continuously monitors a user's posture via webcam feed.
* **Visual Feedback:** Draws keypoints and a skeletal representation on the live video, making posture deviations easy to spot.
* **Web-based Accessibility:** Runs directly in the browser, requiring no complex installations.
* **User-Friendly Interface:** Built with a clean and responsive design for a seamless user experience.
* **Pre-trained AI Models:** Utilizes `ml5.js` with pre-trained models for efficient and accurate pose estimation, eliminating the need for custom model training and extensive data cleaning.

## 🚀 Technologies Used

This project is built using a powerful combination of front-end, back-end, and AI libraries:

### Website Look (Front-End)

* **HTML:** Provides the fundamental structure and content of the web pages.
* **CSS (with Bootstrap):** Styled for a modern, visually appealing, and responsive user interface across various devices.
* **p5.js:** A JavaScript library specifically employed for creative coding and drawing. It is instrumental in rendering the live video feed, overlaying detected body keypoints, and drawing the skeletal structure directly onto the canvas.

### Website's Brains (Back-End & AI)

* **Node.js & Express.js:** These technologies form the robust back-end framework, handling server-side logic, routing, and ensuring the smooth operation of the web application.
* **ml5.js:** A powerful JavaScript library that makes machine learning accessible for the web. In this project, `ml5.js` is crucial for:
    * **Body Pose Estimation:** Implementing pre-trained AI models (like PoseNet or MoveNet) to accurately detect and track human body keypoints in real time from the webcam feed. This allows the application to understand the user's posture without custom model training.

## 💡 Key Advantage: Leveraging Pre-trained AI

A significant strength of this project lies in its strategic focus on utilizing `ml5.js` and `p5.js` with pre-trained AI models for pose estimation. This approach offers several benefits:

* **Accelerated Development:** Eliminates the time-consuming process of training custom AI models from scratch.
* **Reduced Data Requirements:** No need for extensive data collection and laborious data cleaning, allowing for rapid prototyping and deployment.
* **Browser-based AI:** Enables on-device machine learning, enhancing privacy and reducing server-side processing load.

## 🛠️ How to Run

To get this project up and running on your local machine, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/YourGitHubUsername/Real-time-posture-detection.git](https://github.com/YourGitHubUsername/Real-time-posture-detection.git)
    cd Real-time-posture-detection
    ```

2.  **Install Back-End Dependencies:**
    Navigate to the project root and install the Node.js dependencies:
    ```bash
    npm install
    ```

3.  **Start the Back-End Server:**
    ```bash
    node app.js  # Or whatever your main server file is named, e.g., server.js
    ```
    You should see a message indicating the server is running, usually on `http://localhost:3000` (or another port specified in `app.js`).

4.  **Access the Web Application:**
    Open your web browser and navigate to the address where the server is running (e.g., `http://localhost:3000`).

5.  **Grant Webcam Permission:**
    When prompted by your browser, grant permission to access your webcam. The application will then begin real-time posture detection.

## 📂 Project Structure

.

├── public/                 # Front-end static files (HTML, CSS, JavaScript for p5.js, ml5.js)

│   ├── index.html          # Main web page

│   ├── style.css           # Custom CSS for styling

│   └── app.js           # p5.js and ml5.js logic for pose detection and visualization

├── server.js                  # Node.js Express server

├── package.json            # Node.js project dependencies

├── package-lock.json       # Node.js dependency lock file

└── README.md               # This README file
## 📈 Future Enhancements

* **Posture Correction Feedback:** Implement more specific feedback on how to correct different types of poor posture (e.g., "Straighten your back," "Lift your head").
* **Exercise-Specific Guidance:** Integrate recognition for specific exercises (e.g., squats, push-ups) and provide real-time form correction.
* **Historical Data Tracking:** Allow users to track their posture improvement over time.
* **User Profiles & Customization:** Enable user accounts to save preferences and track individual progress.
* **Gamification:** Introduce elements like points, badges, or streaks to motivate users.
* **Mobile Responsiveness:** Further optimize for mobile devices to allow posture detection on phones/tablets.
# 🙌 Acknowledgments

* [ml5.js](https://ml5js.org/) for making machine learning accessible for web development.
* [p5.js](https://p5js.org/) for its incredible capabilities in creative coding and visualization.
* [Node.js](https://nodejs.org/) and [Express.js](https://expressjs.com/) for powering the back-end.
* [Bootstrap](https://getbootstrap.com/) for responsive design
