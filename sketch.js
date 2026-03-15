let floors = []; //Floors of the match
let doors = [];
let ladders = [];
let cameras = [];
let lasers = [];
let guards = [];
let player;
let levelMaps = []; //array of maps for each level
let time = 0;
let level = 1;
let speedruntime;
let numLevels = 4;
let alive = true;
let gameState = "PAUSE"; //"PLAY", "PAUSE", "GAMEOVER", "LOCKPICK", "CLIMBING", "CAUGHT"
let score = 1500;
let lockpick_obj; 



// The index for the door object in the 'doors' list that is being lock-picked.
let current_door_that_is_being_lockpicked_index;

// The index for the ladder object in the 'ladder' list that we are climbing
let current_ladder_that_we_are_climbing_index;
let climbing_up_or_down; // "UP", "DOWN"
let scoreDiv, levelDiv
let levelEnd;


function preload() {
  // Get custom-user-made (which is saved in sessionStorage)
  if (sessionStorage.getItem('custom_user_made_map') !== null) {
    let custom_map_data = sessionStorage.getItem('custom_user_made_map');
    let formatted_data = custom_map_data.split('\n', 5)
    levelMaps.push(formatted_data)
  }

  //load maps for each level (from levels folder)
  for (let i = 0; i < numLevels; i++)
    levelMaps.push(loadStrings("txt_files/" + (i + 1) + ".txt"));
  console.log(levelMaps)
}

function setup() {
  levelDiv = createDiv("Level: " + level);
  scoreDiv = createDiv("Score: " + score);

  background(100);
  stroke(255, 0, 0);
  fill(0, 0, 0);

  _ = loadLevel(levelMaps[level - 1])
  floors = _[0]
  doors = _[1]
  ladders = _[2]
  levelEnd = _[3]
  cameras = _[4]
  lasers = _[5]
  guards = _[6]
  gameState = "PLAY";
}

function draw() {
  background(100);

  if (gameState !== 'GAMEOVER' && gameState !== 'PAUSE' && gameState !== 'CAUGHT') {
    // Timing Code (decrease score)

    time += 1 / frameRate()
    speedruntime = round(1 / frameRate(), 2);

    score = round(score - speedruntime, 2)
    if (score < 0) {
      score = 0;
    }
  }
  fill("yellow")
  textSize(20)
  text("Time: " + round(time, 2), width-115, height - 960);
  
  
  drawBoard(); // implement

  if (gameState == "PAUSE") {
    stroke(255, 0, 0);
    fill(0, 0, 0);
    text("Hit space bar to play LEVEL " + level, 400, 500);

    if (keyIsDown(32)) {
      // space bar is pressed
      if (alive) {
        _ = loadLevel(levelMaps[level - 1]);
        floors = _[0];
        doors = _[1];
        ladders = _[2];
        levelEnd = _[3];
        cameras = _[4]
        lasers = _[5]
        guards = _[6]
        gameState = "PLAY";
      }
    }
  } 

  else if (gameState == "PLAY") {
    play(); // implement
  } 
  
  else if (gameState == "CLIMBING") {
    //console.log(player.loc.y); // 350
    let ladder = ladders[current_ladder_that_we_are_climbing_index];
    //console.log(ladder.loc.y); // 200
    if (climbing_up_or_down == "DOWN") {
      if (player.loc.y + 50 < ladder.loc.y + ladder.height) {
        player.vel.y = player.speed;
        player.update();
      }
      else {
        gameState = "PLAY";
        play();
      }
    }

    if (climbing_up_or_down == "UP") { 
      if (player.loc.y + 50 <= ladder.loc.y + ladder.height && !(player.loc.y + 50 <= ladder.loc.y)) {
        player.vel.y = -player.speed;
        player.update();
      }
      else {
        gameState = "PLAY";
        play();
      }
    }
  }

  else if (gameState == "LOCKPICK") {
    lockpick_obj.update();
    strokeWeight(1);
    if (lockpick_obj.lockStatus == "picked") {
      doors[current_door_that_is_being_lockpicked_index].status = "unlocked";
      gameState = "PLAY";
    } else {
      if (keyIsDown(80)) {
        lockpick_obj.pick_lock();
      }
    }
  }

  else if (gameState == "GAMEOVER") {
    stroke(0, 255, 0);
    fill(0, 0, 0);
    scoreDiv.html("Score: " + score);
    stroke(0, 0, 0);
    text("Thanks for playing!", 500, 500);
  } 

  // CAUGHT state - You got caught by a camera
  else if (gameState == "CAUGHT") {
    stroke(255, 0, 0);
    fill(0, 0, 0);
    score = 0;
    scoreDiv.html("Score: " + score);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Sorry, you have lost!", width / 2, height / 2); // Centered loss message

    // Wait for space bar to reset the game
    if (keyIsDown(32)) {
      gameState = "PAUSE";
      time = 0;  // Reset time
      score = 0;  // Reset score
      //level = 1;  // Restart from level 1
      levelDiv.html("Level: " + level);
      scoreDiv.html("Score: " + score);
    }
  }
}

function drawBoard() {
  // 1- Update score, lives, and level 
  scoreDiv.html("Score: " + score);
  levelDiv.html("Level: " + level);

  // 2- Display All Floors
  for (let i = 0; i < floors.length; i++) {
    floors[i].show();
  }

  // Display All Doors
  for (let i = 0; i < doors.length; i++) {
    doors[i].show();
  }

  // Display all Ladders
  for (let i = 0; i < ladders.length; i++) {
    ladders[i].show();
  }

  // Display lasers
  for (let i = 0; i < lasers.length; i++) {
    lasers[i].update()
  }

  // Display cameras  
  for (i = 0; i < cameras.length; i++) {
    cameras[i].update();
  }

  // Display guards
  for (i = 0; i < guards.length; i++) {
    guards[i].update()
  }

  // Interactions between Doors, Guards, and Bullets
  let left_bound = 0;
  let right_bound = 1000;

  for (i = 0; i < doors.length; i++) {
      // Implements Guards & Bullets
      for (i2 = 0; i2 < guards.length; i2++) {
        if (guards[i2].hasCollisionWithDoor(doors[i]) && doors[i].status == "locked") {
          guards[i2].direction *= -1
          guards[i2].speed *= -1
        }

        for (j = 0; j < guards[i2].bullets.length; j++) {
          if (player.hasCollisionWithBullet(guards[i2].bullets[j])) {
            gameState = "CAUGHT"
          }
          if (guards[i2].bullets[j].hasCollisionWithDoor(doors[i]) && doors[i].status == "locked") {
            guards[i2].bullets.splice(j, 1);
          }
        }
      }


    // Player & Door Interaction
    if (player.hasOverlapWithDoor(doors[i])) {
      // If Player Wants To Lockpick
      if (keyIsDown(81) && doors[i].status == "locked" && gameState == 'PLAY') {
        lockpick_obj = new Lockpick();
        current_door_that_is_being_lockpicked_index = i;
        gameState = "LOCKPICK";
        break;
      // If Player Isn't Lockpicking 
      } else if (doors[i].status == "locked" && !keyIsDown(81)) {
        if (player.loc.x < doors[i].loc.x) right_bound = doors[i].loc.x;
        else if (player.loc.x > doors[i].loc.x + doors[i].width) left_bound = doors[i].loc.x + doors[i].width;
      }
    }
  }
    
  player.update(left_bound, right_bound);
  levelEnd.show();
}

function loadLevel(levelMap) {
  let floor_objs = [];
  let door_objs = [];
  let ladder_objs = [];
  let camera_objs = [];
  let guard_objs = [];
  let laser_objs = [];
  let endpoints = [];
  
 
  if (levelMap.length <= 5) {
    let num_height = 1000
    createCanvas(1000, num_height)
  } else {
    let num_height = (levelMap.length) * 200
    createCanvas(1000, num_height)
  }
 

   // I is the Floor
  for (let i = 0; i < levelMap.length; i++) {
    objects_on_floor = levelMap[i];
    let y_pos = (i + 1) * 200;
    floor_objs.push(new Floor(y_pos, 1000));
    
    // K Is An Item On The Floor
    for (let k = 0; k < objects_on_floor.length; k++) {
      let str = objects_on_floor[k];
      
      // '|' ---> Door
      // '.' ---> Stair
      // '+' ---> Spawn
      // '=' ---> Endpoint
      // '#' ---> Camera
      // '$' ---> LaserGate
      // '@' ---> Guard
      if (str == '|') {
        door_objs.push(new Door(k * 100, (i * 200) + 30));  
      } else if (str == '.') {
        let ladder_top_y_pos = i * 200;
        let ladder_top_x_pos = k * 100;
        ladder_objs.push(new Ladder(ladder_top_x_pos, ladder_top_y_pos));
      } else if (str == "+") {
        let Rob_x_pos = (k * 100) + 50;
        let Rob_y_pos = (i * 200) + 150;
        player = new Rob(Rob_x_pos, Rob_y_pos, 50);
      } else if (str == "=") {
        let end_x_pos = (k * 100);
        let end_y_pos = (i * 200) + 120;
        endpoints.push(new FinishLine(end_x_pos, end_y_pos));
      } else if (str == "#") {
        let end_x_pos = (k * 100);
        let end_y_pos = (i * 200);
        camera_objs.push(new Camera(end_x_pos, end_y_pos));
      } else if (str == "$") {
        let end_x_pos = (k * 100);
        let end_y_pos = (i * 200) + 30;
        laser_objs.push(new LaserGate(end_x_pos, end_y_pos));
      } else if (str == "@") {
        let end_x_pos = (k * 100);
        let end_y_pos = (i * 200) + 150;
        guard_objs.push(new Guard(end_x_pos, end_y_pos));
      }
    } 
  }
  return [floor_objs, door_objs, ladder_objs, endpoints[0], camera_objs, laser_objs, guard_objs];
}

function play() {
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
    player.vel.x = -player.horiziontal_speed;
  }
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
    player.vel.x = player.horiziontal_speed;
  }

  // Collision check with cameras 
  for (i = 0; i < cameras.length; i++) {
    if (player.hasCollisionsWithLight(cameras[i])) {
      gameState = "CAUGHT";  
    }
  }

  // Collision check with lasers
  for (i = 0; i < lasers.length; i++) {
    // If Laser Is Active
    console.log(player.loc.y + 50, lasers[i].loc.y + lasers[i].height)
    if (lasers[i].is_active == 1 && player.loc.x + 30 >= lasers[i].loc.x && player.loc.x < lasers[i].loc.x + lasers[i].width + 2 && player.loc.y + 50 == lasers[i].loc.y + lasers[i].height) {
      gameState = "CAUGHT"
    }
  }

  // Collision check with ladders
  for (i = 0; i < ladders.length; i++) {
    if (player.loc.x >= ladders[i].loc.x && player.loc.x <= ladders[i].loc.x + ladders[i].width && player.loc.y + 49 < ladders[i].loc.y + ladders[i].height && !(player.loc.y + 50 < ladders[i].loc.y)) {
      if (keyIsDown(83)) {
        gameState = "CLIMBING";
        current_ladder_that_we_are_climbing_index = i;
        climbing_up_or_down = "DOWN";
        break;
      }
      
      if (keyIsDown(87)) {
        gameState = "CLIMBING";
        current_ladder_that_we_are_climbing_index = i;
        climbing_up_or_down = "UP";
        break;
      }
    }
  }

  // Collision check with LevelEnd
  if (player.hasCollisionWithCircle(levelEnd)) {
    if (level == numLevels) {
      gameState = "GAMEOVER";
    } else {
      gameState = "PAUSE";
      level += 1;
      speedruntime = 0
      time = 0
    }
  }
}

// Function to save a high score to localStorage
function saveHighScore(score) {
  let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  
  // Add the new score to the list
  highScores.push(score);
  
  // Sort the scores in descending order
  highScores.sort((a, b) => b - a);

  // Limit to top 5 scores
  highScores = highScores.slice(0, 5);

  // Save the updated high scores back to localStorage
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

function getHighScores() {
  return JSON.parse(localStorage.getItem('highScores')) || [];
}

function displayHighScores() {
  const highScores = getHighScores();
  
  //console.log('High Scores:');
  //highScores.forEach((score, index) => {
      //console.log(`${index + 1}. ${score}`);
  //});
}