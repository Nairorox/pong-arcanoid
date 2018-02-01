/*
  Coded by Damian Nowakowski
  https://github.com/Nairorox
  Inspired by Arcanoid & Pong
*/

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const startButton = document.querySelector('.button--start');
const pauseButton = document.querySelector('.button--pause');
const fillStyleStandard = "#000000";
const mainWindow = document.querySelector('main');
const sprintingMeterLeft = document.querySelector('.sprintingMeterLeft');
const sprintingMeterRight = document.querySelector('.sprintingMeterRight');
const scoreDOM = document.querySelectorAll('.score');
const ballContainers = document.querySelectorAll('.powerballsContainer');

ctx.font = "30px Arial";

class Player{
		constructor(x, y, height, width, rebounceRatio, leftControl, rightControl,sprintControl, speed, meter, pushControl, scoreDisplay, powerballsDisplay){
			this.x =  x || 50;
			this.y = y || 500;
			this.height = height || 10;
			this.width = width || 100;
			this.movingRight = false;
			this.movingLeft = false;
			this.leftControl = leftControl || 'a';
			this.sprintControl = sprintControl || 'shift';
			this.sprinting = false;
			this.sprintingValue = 0;
			this.sprintingMeter = meter;
			this.rightControl = rightControl || 'd';
			this.rebounceRatio = rebounceRatio || 2;
			this.initialSpeed = speed || 5;
			this.speed = this.initialSpeed;
			this.ballsFollowing = [];
			this.pushControl = pushControl || 'space';
			this.pushControlPressed = false;
			this.powershots = 3;
			this.score = 0;
			this.scoreDisplay = scoreDisplay;
			this.powerballsDOM = powerballsDisplay || ballContainers[0];
			console.log(this.powerballsDOM);
			game.players.push(this);
		}
		draw(){
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
		updateMove(){
			if(this.movingLeft){
				if(this.x >= this.speed){
					this.x -= this.speed;
				}
				else{
					this.x = 0;
				}
			}
			else if(this.movingRight){
				if(this.x + this.width <= canvas.width - this.speed){
					this.x += this.speed;
				}
				else{
					this.x = canvas.width - this.width;
				}
			}
		};

		stopLeft(){
			this.movingLeft= false;
		};
		stopRight(){
			this.movingRight = false;
		};
		moveRight(){
			this.movingRight = true;
		};
		moveLeft(){
			this.movingLeft = true;
		};
		pushControlPress(){
			this.pushControlPressed = true;
		};
		pushControlRelease(){
			this.pushControlPressed = false;
		};
		pushAllBalls(){
			this.ballsFollowing.forEach(ball =>{
				ball.pushBall(this);
				this.ballsFollowing.shift();
			})
		};

		updatePowerShotsDisplay(){
			console.log(this.powerballsDOM);
			while(this.powerballsDOM.children.length > 0){
				this.powerballsDOM.removeChild(this.powerballsDOM.firstChild);
			}
			for(let i = 0; i < this.powershots; i++){
				let powerBall = document.createElement('div');
				powerBall.classList.add('powershoot');
				powerBall.innerText = 'P';
				this.powerballsDOM.appendChild(powerBall);
			}
			//this.powerballsDOM.innerHTML += ;
		}

		sprint(){
			if(!this.sprinting){
				this.speed += 5;
				this.sprinting = true;
			}
		};
		endSprint(){
			this.speed = this.initialSpeed;
			this.sprinting = false;
		};
		sprintingMechanics(){
			if(this.sprinting){
				if(this.sprintingValue > 0){
					this.sprintingValue -= 0.01;
				}
				else{
					this.endSprint();
				}
			}
			else{
				if(this.sprintingValue < 2){
					this.sprintingValue += 0.01;
				}
			}
			if(this.sprintingMeter){
				this.sprintingMeter.value = this.sprintingValue;
			}
		};
}

class Ball{
	constructor(x, y, r){
		this.x = x || Math.floor(Math.random()*canvas.width-5)+5;
		this.y = y || canvas.height/2;
		this.r = r || 5;
		this.xSpeed = Math.random()-0.5; // between 0 && 1
		this.ySpeed = -1;	//should be 1 / -1 
		this.followedPlayer = null;
		this.curColor = fillStyleStandard;
		game.balls.push(this);
	}
	update(){
		if(this.followedPlayer){
					this.ySpeed = 0;
					this.xSpeed = 0;
					this.x = this.followedPlayer.x + ((this.followedPlayer.x + this.followedPlayer.width/2)/canvas.width) * this.followedPlayer.width
					this.y = this.followedPlayer === game.players[0] ? this.followedPlayer.y -	 this.r - 1 : this.followedPlayer.y + this.r + this.followedPlayer.height + 1; //depending on followed player, ball will be at top or bottom of player
		}
		else{
			//slowing ball (after push)
			if(this.ySpeed > 1){
				this.ySpeed -= 0.01;
			}
			if(this.ySpeed < -1){
				this.ySpeed += 0.01;
			}

			this.x += this.xSpeed * game.gameSpeed;
			this.y -= this.ySpeed * game.gameSpeed;
			if(this.x + this.r + this.xSpeed >= canvas.width){	//right wall
				this.xSpeed = -Math.abs(this.xSpeed);
			}
			if(this.x - this.r + this.xSpeed <= 0){	//left wall
				this.xSpeed = Math.abs(this.xSpeed);
			}
			if(this.y - this.r <= 0 - this.ySpeed){	//top wall (bottom player score, upper lose)
				this.y = 1 + this.r;
				this.ySpeed = -this.ySpeed;
				if(game.activeMode == 'arcanoid'){
					game.rebounds += 1;
				}
				else{	//pong
				//player.score += 1;
					this.followedPlayer = game.players[1];
					this.followedPlayer.ballsFollowing.push(this);
					game.players[0].score += 1;
					game.resetPS();
					game.updateAfterPoint();
				}
			}
				//down wall
			if(this.y > canvas.height){
				this.ySpeed = -this.ySpeed;
				game.rebounds = 0;
					this.followedPlayer = game.players[0];
					this.followedPlayer.ballsFollowing.push(this);
					game.resetPS();

					if(game.activeMode == "pong"){
						game.players[1].score += 1;
						game.updateAfterPoint();
					}
			}
		}
	};   
	pushBall(fromPlayer){
		if(!this.followedPlayer && fromPlayer){	//standard power ball
			if(fromPlayer.powershots < 1){
				return;
			}
			fromPlayer.powershots--;
			fromPlayer.updatePowerShotsDisplay();
			game.updateAfterPoint();
		}
		if(this.followedPlayer){	//powerball direction after lost point
			this.xSpeed = (((this.x - fromPlayer.x)-50)/fromPlayer.width)*fromPlayer.rebounceRatio;
		}
		this.followedPlayer = null;
		this.ySpeed += fromPlayer === game.players[1] ? -1.5 :  1.5;	//if it's bottom player then swap direction for rebounce, ball also moves faster for a while
		this.curColor = "#FF0000"
	};
	checkPlatform(platform){	//checks if ball touches platform
		if(platform.alive){	//need fix
				if(this.x + this.r >= platform.x && this.x - this.r <= platform.x + platform.width && this.y - this.r >= platform.y && this.y - this.r <= platform.y + platform.height){
					//this.y += game.gameSpeed;
					this.ySpeed = -this.ySpeed;
					platform.die();
				}
		}
	}
	lookForPlayerRebounce(player){
		if(this.y + this.r >= player.y && this.y - this.r <= player.y + player.height && this.x + this.r + 2 >= player.x && this.x - this.r - 2 <= player.x+player.width){
			this.xSpeed = (((this.x - player.x)-50)/player.width)*player.rebounceRatio;
			this.y += ((this.r - this.ySpeed)* this.ySpeed);
			this.ySpeed = -this.ySpeed;
			if(game.basicBotOn && player == game.players[1]){
				if(this.ySpeed > -3.5){
					this.ySpeed	-= 1.15;
				}
			}
			if(player.pushControlPressed){
				this.pushBall(player)
			}
		}
	};

	drawBall(){
		ctx.beginPath();
		ctx.fillStyle = this.curColor
		ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
		ctx.stroke();
		ctx.fill();
		ctx.fillStyle = fillStyleStandard;
	};
}

class Platform{
	constructor(x, y, width, height, color, special){
		this.x = x;
		this.y = y;
		this.width = width || 50;
		this.height = height || 20;
		this.alive = true;
		this.color = color || fillStyleStandard;
		this.special = special;
		game.platforms.push(this);
	}

	draw(){
		if(this.alive){
			if(this.color){
				ctx.fillStyle = this.color;
			}
			ctx.fillRect(this.x, this.y, this.width, this.height);
			ctx.fillStyle = fillStyleStandard;
		}
	}

	die(){
		game.platforms.splice(game.platforms.indexOf(this), 1);

		this.alive = false;
		delete this;

		if(game.platforms.length == 0){
			game.activeTexts.push({text: 'Winner', x: 100, y: 200})
		}
	}
}

const game = {
	gameFps: 60,
	gameSpeed: 5,
	pause:false,
	platforms:[],
	modes:['pong', 'arcanoid'],
	activeMode:'pong',
	rebounds:0,
	working: null,
	basicBotOn: false,
	activeTexts: [{text: 'Beta', x: 210, y:100,}],
	players:[],
	balls:[],
	clearAllPlayers: function(){
		while(this.players.length > 0){
			this.players.splice(0, 1);
		}
	},
	createMainPlayer: function(){
		new Player(null, null, null, null, null, null, null, null, null, sprintingMeterLeft, ' ', scoreDOM[0], ballContainers[0]);
	},

	difficultyIncrease: function(){
		game.gameSpeed += 1;
	},

	showSomeText: function(text, x, y, center){
		if(center){
			ctx.fillText(text, canvas.offsetWidth/2 - text.length*7, canvas.offsetHeight/2 - 8);
		}
		else{
			ctx.fillText(text, x, y);
		}
	},
	setControls: function(specific){
			game.players.forEach(player =>{	//setting controls for players
				document.addEventListener('keydown', function(e){	//moving
					if(e.key.toLowerCase() == player.leftControl){
						player.moveLeft();
					}
					if(e.key.toLowerCase() == player.rightControl){
						player.moveRight();
					}
					if(e.key.toLowerCase() == player.sprintControl){
						player.sprint();
					}
					if(e.key.toLowerCase() == player.pushControl){
						e.preventDefault();
						player.pushAllBalls();
						player.pushControlPress();
					}
				});

				document.addEventListener('keyup', function(e){	//moving
					if(e.key.toLowerCase() == player.leftControl){
						player.stopLeft();
					}
					if(e.key.toLowerCase() == player.rightControl){
						player.stopRight();
					}
					if(e.key.toLowerCase() == player.sprintControl){
						player.endSprint();
					}
					if(e.key.toLowerCase() == player.pushControl){
						player.pushControlRelease();
					}
				});
			});
	},


	updateAfterPoint: function(){
		this.players.forEach(player =>{
			player.scoreDisplay.innerText = player.score;
			player.updatePowerShotsDisplay();
		});
	},

	resetPS: function(){
			this.players.forEach(player =>{
				player.powershots = 3;
				this.updateAfterPoint();
			});
	},
	//refreshing each frame
	main: function(){
		if(!this.pause){
		//clearing screen
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		//texts
		this.activeTexts.forEach(arrItem =>{
			game.showSomeText(arrItem.text, arrItem.x, arrItem.y);
		});
		//players
		this.players.forEach(player =>{
			this.balls.forEach(ball =>{	//collisions with each ball?
				ball.lookForPlayerRebounce(player);
				this.platforms.forEach(platform =>{
					ball.checkPlatform(platform);
				});
			});
			player.updateMove();
			player.draw();
			player.sprintingMechanics();
		});
		//balls
		this.balls.forEach(ball =>{
			ball.drawBall();
			ball.update();
		});
		//platforms
		game.platforms.forEach(platform =>{
			platform.draw();
		});
	}

	if(game.basicBotOn){
		if(game.balls[0].followedPlayer !== game.players[1] && game.players.length > 1){
			game.players[1].x = game.balls[0].x;
		}
	}

	},	//end of main


	//clicking start button
	start: function(){
		if(this.working){
			clearInterval(this.working);
		}
		game.pause = false;
		canvas.style.borderTop = 'none';

		//setting arcanoid
		if(game.activeMode == 'arcanoid'){
			//clearing and creating just one player
			canvas.style.borderTop = 'solid';
			game.clearAllPlayers();
			game.createMainPlayer();
			//creating platforms
			for(var i = 0; i < 9; i++){
				for(var j = 0; j < 4; j++){
					new Platform(i*55 + 5, j*25 + 10, null, null, `hsl(${i*10*j*10}, 100%, 50%)`);
				}
			}
		}
		else{
			game.clearAllPlayers();
			game.createMainPlayer();
			new Player(null, 50, null, null, null, 'arrowleft', 'arrowright', 'arrowup', null, sprintingMeterRight, 'arrowdown',  scoreDOM[1], ballContainers[1]);
		}

		game.setControls();	//setting controls
		game.players.forEach(player => {
			player.score = 0;
		})

		game.balls.forEach(ball =>{
			ball.followedPlayer = null;
			ball.pushBall();
			ball.ySpeed = 1;	//maybe some kind of coinflip to determine who starts?
		})

		game.updateAfterPoint();

		//mobile controls just learning it

		function mobileMoving(e){
				e.preventDefault();
				game.players[0].x = (e.touches[0].clientX - canvas.offsetLeft - game.players[0].width/2) * canvas.width/canvas.offsetWidth;
		}

		function mobilePush(){
			game.players.forEach(player =>{
				player.pushAllBalls();
			})
		}

		canvas.addEventListener('touchstart', function(e){
			game.basicBotOn = true;
			e.preventDefault();

			canvas.addEventListener('touchmove', mobileMoving);

			canvas.addEventListener('touchend', function(e){
				canvas.removeEventListener('touchmove', mobileMoving);
			});

			canvas.addEventListener('touchstart', function(e){
				mobilePush();
				setTimeout(function(){
					canvas.removeEventListener('touchstart', mobilePush);
				}, 200);
			});

		});

		this.working = setInterval(function(){ //interval for each frame
			game.main();
		}, 1000/game.gameFps);
	},
	pause:function(){
		game.pause = !game.pause;
	}
}

startButton.addEventListener('click', game.start);
pauseButton.addEventListener('click', game.pause);

new Ball();