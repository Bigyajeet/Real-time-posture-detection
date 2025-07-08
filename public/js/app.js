let video;
let bodyPose;
let poses = [];
let instructionsDiv;
let feedbackDiv;
let keypointInfoListDiv; // Renamed for clarity with Bootstrap list

let poseTimer = 0;
let targetPose = 'T-Pose'; // Initial target pose
let poseAchieved = false;
let poseStartTime = 0;
const POSE_HOLD_TIME = 3; // Seconds to hold a pose

// Preload the BodyPose model
function preload() {
    bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

// Callback function when poses are detected
function gotPoses(results) {
    poses = results;
}

// Setup function for p5.js
function setup() {
    // Determine canvas size based on the Bootstrap column it will reside in
    // Assuming col-md-8, which is 2/3 of the row width
    const videoCol = document.querySelector('.col-md-8');
    // Calculate 2/3 of the main-container width, then adjust for padding/margins
    // A simpler approach: set a max width and let Bootstrap handle responsiveness
    const maxCanvasWidth = 640; // Max width for the video feed
    let canvasWidth = Math.min(maxCanvasWidth, videoCol.offsetWidth - 30); // Account for column padding

    // Ensure canvasWidth is at least a reasonable size for detection
    if (canvasWidth < 320) canvasWidth = 320;

    const canvasHeight = (canvasWidth / 640) * 480; // Maintain aspect ratio

    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container-wrapper'); // Attach canvas to the wrapper div

    // Create video capture and hide the default HTML element
    video = createCapture(VIDEO, { flipped: true });
    video.size(canvasWidth, canvasHeight); // Set video size to match canvas
    video.hide();

    // Start bodyPose detection
    bodyPose.detectStart(video, gotPoses);

    // Get references to instruction, feedback, and keypoint info divs
    instructionsDiv = document.getElementById('instructions');
    feedbackDiv = document.getElementById('feedback');
    keypointInfoListDiv = document.getElementById('keypoint-info-list'); // Get reference to the new list div

    // Initial instructions
    updateInstructions("Stand in front of your webcam.");
}

// Draw function for p5.js (runs continuously)
function draw() {
    // Draw the video feed on the canvas
    image(video, 0, 0, width, height); // Ensure video fills the canvas

    // If a pose is detected
    if (poses.length > 0) {
        let pose = poses[0]; // Get the first detected pose

        // Draw keypoints
        for (let i = 0; i < pose.keypoints.length; i++) {
            let keypoint = pose.keypoints[i];
            if (keypoint.confidence > 0.1) { // Only draw if confidence is high enough
                fill(255, 100, 0); // Orange color for keypoints
                noStroke();
                circle(keypoint.x, keypoint.y, 14); // Slightly larger circles
                  fill(255);
            textSize(10);
            textAlign(CENTER,CENTER);
            let confscore=nf(keypoint.confidence,0,2);
            text(confscore,keypoint.x,keypoint.y-20);
            }
        }

        // Draw connections (skeleton)
        let connections = bodyPose.getSkeleton();
        for (let i = 0; i < connections.length; i++) {
            let connection = connections[i];
            let a = connection[0];
            let b = connection[1];
            let keypointA = pose.keypoints[a];
            let keypointB = pose.keypoints[b];

            // Only draw connections if both keypoints are confident
            if (keypointA.confidence > 0.1 && keypointB.confidence > 0.1) {
                stroke(0, 200, 255); // Cyan color for connections
                strokeWeight(6); // Thicker lines
                line(keypointA.x, keypointA.y, keypointB.x, keypointB.y);
            }
        }

        // Update keypoint info panel with ALL keypoints
        displayAllKeypointInfo(pose);

        // Evaluate posture and update instructions/feedback
        evaluatePose(pose);

    } else {
        // No pose detected
        updateInstructions("Move into the camera view.");
        updateFeedback(""); // Clear feedback
        updateKeypointInfo("No pose detected. Please ensure your camera is on and you are in view."); // Clear keypoint info
        poseAchieved = false; // Reset pose status
        poseStartTime = 0; // Reset timer
    }
}

// Function to update instructions on the screen
function updateInstructions(text) {
    if (instructionsDiv) {
        instructionsDiv.innerHTML = text;
    } else {
        console.error("Instructions div not found!");
    }
}

// Function to update feedback on the screen
function updateFeedback(text) {
    if (feedbackDiv) {
        feedbackDiv.innerHTML = text;
    } else {
        console.error("Feedback div not found!");
    }
}

// Function to update the keypoint info panel (generic, used for initial message)
function updateKeypointInfo(htmlContent) {
    if (keypointInfoListDiv) {
        keypointInfoListDiv.innerHTML = `<p class="text-muted">${htmlContent}</p>`;
    } else {
        console.error("Keypoint info list div not found!");
    }
}

// Function to display ALL keypoint data in the info panel
function displayAllKeypointInfo(pose) {
    let infoHtml = '';
    // Iterate through all keypoints provided by BlazePose (typically 33 keypoints)
    for (let i = 0; i < pose.keypoints.length; i++) {
        const keypoint = pose.keypoints[i];
        // Use the name property directly from the keypoint object
        const kpName = keypoint.part;

        if (keypoint && keypoint.confidence > 0.1) {
            const x = nf(keypoint.x, 0, 0); // No decimals for coordinates
            const y = nf(keypoint.y, 0, 0);
            const conf = nf(keypoint.confidence, 0, 2); // 2 decimals for confidence
            infoHtml += `
                <div class="keypoint-item">
                    <span class="keypoint-name">${kpName}:</span><br>
                    <span class="keypoint-coords">X: ${x}, Y: ${y}</span><br>
                    <span class="keypoint-confidence">Confidence: ${conf}</span>
                </div>
            `;
        } else {
            infoHtml += `
                <div class="keypoint-item">
                    <span class="keypoint-name">${kpName}:</span><br>
                    <span class="text-muted">Not detected or low confidence.</span>
                </div>
            `;
        }
    }

    if (keypointInfoListDiv) {
        keypointInfoListDiv.innerHTML = infoHtml;
    }
}


// Function to evaluate the detected pose and provide feedback
function evaluatePose(pose) {
    let currentFeedback = "";
    let isCurrentPoseCorrect = false;

    // Example: Check for a simple "T-Pose"
    // A T-pose typically involves arms extended horizontally.
    // We'll check the y-coordinates of wrists and shoulders.
    // And x-coordinates for alignment.

    const leftShoulder = pose.keypoints[5];
    const rightShoulder = pose.keypoints[6];
    const leftElbow = pose.keypoints[7];
    const rightElbow = pose.keypoints[8];
    const leftWrist = pose.keypoints[9];
    const rightWrist = pose.keypoints[10];

    // Check if keypoints are confident enough to be used
    const confidentEnough = (kp) => kp && kp.confidence > 0.5;

    if (confidentEnough(leftShoulder) && confidentEnough(rightShoulder) &&
        confidentEnough(leftElbow) && confidentEnough(rightElbow) &&
        confidentEnough(leftWrist) && confidentEnough(rightWrist)) {

        // Check horizontal alignment of shoulders (roughly same Y)
        const shouldersAligned = abs(leftShoulder.y - rightShoulder.y) < 30;

        // Check if arms are roughly horizontal (wrists and elbows close to shoulder Y)
        const leftArmHorizontal = abs(leftWrist.y - leftShoulder.y) < 50 && abs(leftElbow.y - leftShoulder.y) < 50;
        const rightArmHorizontal = abs(rightWrist.y - rightShoulder.y) < 50 && abs(rightElbow.y - rightShoulder.y) < 50;

        // Check if arms are extended outwards (wrists further from body than elbows, and elbows further than shoulders)
        // This is a simplification; a more robust check would involve angles.
        const leftArmExtended = leftWrist.x < leftElbow.x && leftElbow.x < leftShoulder.x; // Assuming flipped video, left is on the right side of screen
        const rightArmExtended = rightWrist.x > rightElbow.x && rightElbow.x > rightShoulder.x; // Assuming flipped video, right is on the left side of screen

        if (shouldersAligned && leftArmHorizontal && rightArmHorizontal && leftArmExtended && rightArmExtended) {
            isCurrentPoseCorrect = true;
            currentFeedback = "T-Pose detected!";
        } else {
            currentFeedback = "Adjust your T-Pose. Keep arms horizontal and extended.";
        }

    } else {
        currentFeedback = "Move closer or ensure full body is visible for T-Pose detection.";
    }

    // Update instruction based on pose state
    if (isCurrentPoseCorrect) {
        if (!poseAchieved) {
            poseAchieved = true;
            poseStartTime = millis(); // Start timer
        }

        let timeHeld = (millis() - poseStartTime) / 1000;
        if (timeHeld >= POSE_HOLD_TIME) {
            updateInstructions("Great job! You held the T-Pose!");
            updateFeedback("Pose complete!");
            // You can add logic here to move to next pose, save data, etc.
            // For now, it just stays in "complete" state.
        } else {
            let timeLeft = Math.ceil(POSE_HOLD_TIME - timeHeld);
            updateInstructions(`Hold the T-Pose for ${timeLeft} more seconds!`);
            updateFeedback(currentFeedback);
        }
    } else {
        updateInstructions(`Try to make a T-Pose. Extend your arms horizontally.`);
        updateFeedback(currentFeedback);
        poseAchieved = false; // Reset if pose is broken
        poseStartTime = 0; // Reset timer
    }
}

// Function to handle window resizing
function windowResized() {
    const videoCol = document.querySelector('.col-md-8');
    const maxCanvasWidth = 640;
    let canvasWidth = Math.min(maxCanvasWidth, videoCol.offsetWidth - 30); // Account for column padding
    if (canvasWidth < 320) canvasWidth = 320; // Minimum width
    const canvasHeight = (canvasWidth / 640) * 480;
    resizeCanvas(canvasWidth, canvasHeight);
    video.size(canvasWidth, canvasHeight); // Resize video feed as well
}
