let video;
let bodyPose;
let poses = [];
let instdiv;
let fbdiv;  
let  kpLdiv;

let poseTimer = 0;
let tpose = 'T-Pose'; 
let poseAch = false;  
let poseStT = 0;  
const POSE_HOLD_TIME = 3; 


function preload() {
    bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}


function gotPoses(results) {
    poses = results;
}


function setup() {
    
    const videoCol = document.querySelector('.col-md-8');
    
    const maxCanWid = 640; 
    let canWid = Math.min(maxCanWid, videoCol.offsetWidth - 30);


    if (canWid < 320) canWid = 320;

    const canH = (canWid / 640) * 480; 

    let canvas = createCanvas(canWid, canH);
    canvas.parent('canvas-container-wrapper'); 


    video = createCapture(VIDEO, { flipped: true });
    video.size(canWid, canH);
    video.hide();

 
    bodyPose.detectStart(video, gotPoses);

   
    instdiv = document.getElementById('instructions');
    fbdiv = document.getElementById('feedback');
     kpLdiv = document.getElementById('keypoint-info-list'); 

    
    uInst("Stand in front of your webcam."); 
}


function draw() {

    image(video, 0, 0, width, height); 


    if (poses.length > 0) {
        let pose = poses[0];

       
        for (let i = 0; i < pose.keypoints.length; i++) {
            let keypoint = pose.keypoints[i];
            if (keypoint.confidence > 0.1) { 
                fill(255, 100, 0); 
                noStroke();
                circle(keypoint.x, keypoint.y, 14);
                  fill(255);
            textSize(10);
            textAlign(CENTER,CENTER);
            let confscore=nf(keypoint.confidence,0,2);
            text(confscore,keypoint.x,keypoint.y-20);
            }
        }

       
        let connections = bodyPose.getSkeleton();
        for (let i = 0; i < connections.length; i++) {
            let connection = connections[i];
            let a = connection[0];
            let b = connection[1];
            let keypointA = pose.keypoints[a];
            let keypointB = pose.keypoints[b];

           
            if (keypointA.confidence > 0.1 && keypointB.confidence > 0.1) {
                stroke(0, 200, 255); 
                strokeWeight(6); 
                line(keypointA.x, keypointA.y, keypointB.x, keypointB.y);
            }
        }

       
        dKpInfo(pose);  

   
         evalPose(pose);

    } else {
        
        uInst("Move into the camera view.");
         uFeedback("");  
        uKpInfo("No pose detected. Please ensure your camera is on and you are in view."); 
        poseAch = false; 
        poseStT = 0; 
    }
}


function uInst(text) {
    if (instdiv) {
        instdiv.innerHTML = text;
    } else {
        console.error("Instructions div not found!");
    }
}


function  uFeedback(text) {
    if (fbdiv) {
        fbdiv.innerHTML = text;
    } else {
        console.error("Feedback div not found!");
    }
}


function uKpInfo(htmlContent) {
    if ( kpLdiv) {
         kpLdiv.innerHTML = `<p class="text-muted">${htmlContent}</p>`;
    } else {
        console.error("Keypoint info list div not found!");
    }
}


function dKpInfo(pose) {
    let infoHtml = '';

    for (let i = 0; i < pose.keypoints.length; i++) {
        const keypoint = pose.keypoints[i];
    
        const kpName = keypoint.part;

        if (keypoint && keypoint.confidence > 0.1) {
            const x = nf(keypoint.x, 0, 0);
            const y = nf(keypoint.y, 0, 0);
            const conf = nf(keypoint.confidence, 0, 2); 
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

    if ( kpLdiv) {
         kpLdiv.innerHTML = infoHtml;
    }
}


function  evalPose(pose) {
    let currFb = ""; 
    let isCurrPoseC = false; 

    
    const lS = pose.keypoints[5]; 
    const rS = pose.keypoints[6];
    const lE = pose.keypoints[7];
    const rE = pose.keypoints[8];
    const lW = pose.keypoints[9];
    const rW = pose.keypoints[10];

    const cEnough = (kp) => kp && kp.confidence > 0.5;  

    if (cEnough(lS) && cEnough(rS) &&
        cEnough(lE) && cEnough(rE) &&
        cEnough(lW) && cEnough(rW)) {

      
        const sAlig = abs(lS.y - rS.y) < 30; 

        const  lArmH = abs(lW.y - lS.y) < 50 && abs(lE.y - lS.y) < 50; 
        const rArmH = abs(rW.y - rS.y) < 50 && abs(rE.y - rS.y) < 50;  

        
        const lArmExt = lW.x < lE.x && lE.x < lS.x; lArmExt
        const rArmExt = rW.x > rE.x && rE.x > rS.x; 

        if (sAlig &&  lArmH && rArmH && lArmExt && rArmExt) {
            isCurrPoseC = true;
            currFb = "T-Pose detected!";
        } else {
            currFb = "Adjust your T-Pose. Keep arms horizontal and extended.";
        }

    } else {
        currFb = "Move closer or ensure full body is visible for T-Pose detection.";
    }

    
    if (isCurrPoseC) {
        if (!poseAch) {
            poseAch = true;
            poseStT = millis(); 
        }

        let timeHeld = (millis() - poseStT) / 1000;
        if (timeHeld >= POSE_HOLD_TIME) {
            uInst("Great job! You held the T-Pose!");
             uFeedback("Pose complete!");
            
        } else {
            let timeLeft = Math.ceil(POSE_HOLD_TIME - timeHeld);
            uInst(`Hold the T-Pose for ${timeLeft} more seconds!`);
             uFeedback(currFb);
        }
    } else {
        uInst(`Try to make a T-Pose. Extend your arms horizontally.`);
         uFeedback(currFb);
        poseAch = false; 
        poseStT = 0; 
    }
}


function windowResized() {
    const videoCol = document.querySelector('.col-md-8');
    const maxCanWid = 640;
    let canWid = Math.min(maxCanWid, videoCol.offsetWidth - 30);
    if (canWid < 320) canWid = 320; 
    const canH = (canWid / 640) * 480;
    resizeCanvas(canWid, canH);
    video.size(canWid, canH);
}
