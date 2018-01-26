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

ctx.font = "30px Arial";

class Player{
		constructor(x, y, height, width, rebounceRatio, leftControl, rightControl,sprintControl, speed, meter, pushControl){
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
			this.score = 0;
			this.pushControl = pushControl || 'space';
			this.ballsFollowing = [];
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
		pushAllBalls(){
			this.ballsFollowing.forEach(ball =>{
				ball.pushBall(this);
				this.ballsFollowing.shift();
			})
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
		this.y = y || 100;
		this.r = r || 5;
		this.xSpeed = Math.random()-0.5; // between 0 && 1
		this.ySpeed = -1;	//should be 1 / -1 
		this.followedPlayer = null;
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
			if(this.y - this.r <= 0 - this.ySpeed){	//top wall
				console.log(5);
				this.y = 1 + this.r;
				this.ySpeed = -this.ySpeed;
				if(game.activeMode == 'arcanoid'){
					game.rebounds += 1;
				}
				else{	//pong
				//player.score += 1;
					this.followedPlayer = game.players[1];
					this.followedPlayer.ballsFollowing.push(this);
				}
			}
				//down wall
			if(this.y > canvas.height){
				this.y = canvas.height/2 + this.r;
				this.ySpeed = -this.ySpeed;
				game.rebounds = 0;
				if(game.activeMode === 'pong'){
					this.followedPlayer = game.players[0];
					this.followedPlayer.ballsFollowing.push(this);
					//player2.score += 1;
				}
			}
		}
	};
	pushBall(fromPlayer){
		this.followedPlayer = null;
		fromPlayer === game.players[0] ? this.ySpeed = -2.5 : this.ySpeed = 2.5;	//if it's bottom player then swap direction for rebounce, ball also moves faster for a while
	};
	checkPlatform(platform){	//checks if ball touches platform
		if(platform.alive){	//need fix
				if(this.x + this.r >= platform.x && this.x - this.r <= platform.x + platform.width && this.y - this.r >= platform.y && this.y - this.r <= platform.y + platform.height){
					this.y += game.gameSpeed;
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
		}
	};

	drawBall(){
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
		ctx.stroke();
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
	activeTexts: [{text: 'Beta', x: 210, y:100,}],
	players:[],
	balls:[],
	clearAllPlayers: function(){
		while(this.players.length > 0){
			this.players.splice(0, 1);
		}
	},
	createMainPlayer: function(){
		new Player(null, null, null, null, null, null, null, null, null, sprintingMeterLeft, ' ');
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
				});
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

	},	//end of main


	//clicking start button
	start: function(){
		if(this.working){
			clearInterval(this.working);
		}
		game.balls.forEach(ball =>{
			ball.followedPlayer = null;
			ball.pushBall();
		})
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
			new Player(null, 50, null, null, null, 'arrowleft', 'arrowright', 'arrowup', null, sprintingMeterRight, 'arrowdown');
		}

		game.setControls();	//setting controls

		//mobile controls just learning it

		function mobileMoving(e){
				e.preventDefault();
				game.players[0].x = e.touches[0].clientX - canvas.offsetLeft + game.players[0].width/2;
		}

		canvas.addEventListener('touchstart', function(e){
			e.preventDefault();

			canvas.addEventListener('touchmove', mobileMoving);

			canvas.addEventListener('touchend', function(e){
				canvas.removeEventListener('touchmove', mobileMoving);
			})

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