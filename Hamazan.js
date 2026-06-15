// LOGIN
function connexion() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    if (email !== "" && password !== "") {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("container").style.display = "flex";
        afficherNews();
    } else {
        alert("Remplis les champs !");
    }
}

// DATA
const dataGlobal = {
    news: [
        "Nouvelle attaque phishing détectée",
        "Mise à jour sécurité importante"
    ],
    info: [
        "Activez le 2FA",
        "Ne cliquez pas sur des liens suspects"
    ]
};

// NEWS
function afficherNews() {
    let contenu = "<h2>News</h2><ul>";
    dataGlobal.news.forEach(n => {
        contenu += "<li>" + n + "</li>";
    });
    contenu += "</ul>";

    document.getElementById("textContent").innerHTML = contenu;
}

// INFO
function afficherInfo() {
    document.getElementById("textContent").innerHTML =
        "<h2>Info</h2><p>Conseils de sécurité disponibles ici.</p>";
}

// REPORT
function afficherReport() {
    document.getElementById("textContent").innerHTML = `
        <h2>Report</h2>
        <form onsubmit="envoyerSignalement(event)">
            <div class="form-group">
                <input id="email" placeholder="email">
            </div>
            <div class="form-group">
                <textarea id="message" placeholder="message"></textarea>
            </div>
            <div class="form-group">
                <textarea id="description" placeholder="suspect"></textarea>
            </div>
            <button class="form-submit" type="submit">Envoyer</button>
        </form>
    `;
}

// POWER AUTOMATE
function envoyerSignalement(event) {
    event.preventDefault();

    fetch("TON_URL_POWER_AUTOMATE", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            message: document.getElementById("message").value,
            description: document.getElementById("description").value
        })
    })
    .then(() => alert("Signalement envoyé"))
    .catch(() => alert("Erreur"));
}

// JEU (simplifié — tu peux remettre le tien complet)
function AfficherJeu() {
    document.getElementById("textContent").innerHTML = `
    <h2>Support</h2>

    <p style="text-align:center; font-size:18px;">
        0 à 10 points : vous payez le restaurant |
        10 à 20 points : vous ramenez les croissants |
        20+ : vous avez tout de même cliqué sur un lien suspect, dans le doute, faîtes report email
    </p>

    <canvas id="game" width="400" height="600"></canvas>
`;
    initJeu();
}

function initJeu() {
    const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// taille responsive
canvas.width = Math.min(window.innerWidth * 0.9, 600);
canvas.height = Math.min(window.innerHeight * 0.9, 800);

const W = canvas.width;
const H = canvas.height;

const PIPE_WIDTH = 60;
const GAP = 220;
const PLAYER_X = 120;

let y = H/2;
let vy = 0;
let pipes = [];
let score = 0;
let best = 0;
let timer = 0;
let running = false;

// effets
let flipHorizontal = false;
let rotation = 0;
let rotationSpeed = 0;
let effectTimer = 0;
const EFFECT_INTERVAL = 300;

function randomEffect() {
  let r = Math.random();

  // reset effects
  flipHorizontal = false;
  rotationSpeed = 0;

  if(r < 0.33) {
    flipHorizontal = true;
  } else if(r <0.66) {
    rotationSpeed = (Math.random() - 0.5) * 0.3;
  } 
}

function flap(){
  running = true;
  vy = -9;
}

document.addEventListener("keydown", e=>{
  if(e.code==="Space") flap();
});


canvas.addEventListener("click", flap);

function spawnPipe(){
  let margin = 80;
  let gapY = Math.random()*(H-GAP-margin*2)+margin;

  pipes.push({
    x:W,
    gapY,
    passed:false
  });
}


function reset(){
  if(score > best) best = score;

  y = H/2;
  vy = 0;
  pipes = [];
  score = 0;
  running = false;

  timer = 0;

  flipHorizontal = false;
  rotation = 0;
  rotationSpeed = 0;
}

function loop(){
  requestAnimationFrame(loop);

  ctx.save();

  // fond
  let g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#9d2933");
  g.addColorStop(1,"#551606");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  if(running){
    vy += 0.35;
    y += vy;

    timer += 1/60;

    effectTimer++;
    if(effectTimer >= EFFECT_INTERVAL) {
      effectTimer = 0;
      randomEffect();
    }

    if(pipes.length===0 || pipes[pipes.length-1].x < W-250){
      spawnPipe();
    }

    pipes.forEach(p=>p.x -= 2.2);

    // rotation douce
    rotation += rotationSpeed;
    rotationSpeed *= 0.98; // ralentit doucement
  }

  // TRANSFORMATIONS
  ctx.translate(W/2, H/2);

  ctx.rotate(rotation);

  if(flipHorizontal) ctx.scale(-1,1);

  ctx.translate(-W/2, -H/2);

  // tuyaux
  pipes.forEach(p=>{
    drawPipe(p.x,0,PIPE_WIDTH,p.gapY);
    drawPipe(p.x,p.gapY+GAP,PIPE_WIDTH,H);
  });


  // joueur
  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.arc(PLAYER_X,y,12,0,Math.PI*2);
  ctx.fill();

  ctx.restore();

  // === SCORE + COLLISIONS ===
  pipes.forEach(p=>{
    if(!p.passed && p.x+PIPE_WIDTH < PLAYER_X){
      p.passed = true;
      score++;
    }

    let collisionX = PLAYER_X+12 > p.x && PLAYER_X-12 < p.x+PIPE_WIDTH;
    let inGap = y > p.gapY && y < p.gapY+GAP;

    if(collisionX && !inGap){
      reset();
    }
  });

  // Ex Bubble effect
  

  pipes = pipes.filter(p=>p.x > -PIPE_WIDTH);

  // HUD
  ctx.fillStyle="#000";
  ctx.font="bold 26px Arial";
  // Score
  ctx.textAlign="left";
  ctx.fillText("Score : "+score, 20, 40);
  //Timer
  ctx.textAlign = "center";
  let timeLeft = Math.ceil((EFFECT_INTERVAL - effectTimer) / 60);
  ctx.fillText("Timer : " + timeLeft, W/2, 40);
  //Best Score
  ctx.textAlign="right";
  ctx.fillText("Best : "+best, W - 20, 40);

}

function drawPipe(x,y,w,h){
  ctx.fillStyle="#fe8f8e";
  ctx.fillRect(x,y,w,h);

  ctx.fillRect(x,y,w,10);

  ctx.strokeStyle="#161616";
  ctx.strokeRect(x,y,w,h);
}

  loop();
}
