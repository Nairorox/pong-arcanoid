/*
  Coded by Damian Nowakowski
  https://github.com/Nairorox
  Inspired by Arcanoid & Pong
*/

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const startButton = document.querySelector('.button--start');
const fillStyleStandard = "#000000";
const mainWindow = document.querySelector('main');

ctx.font = "30px Arial";

class Player{	//TODO: swap to class
		constructor(x, y, height, width, rebounceRatio, leftControl, rightControl){
			this.x =  x || 50;
			this.y = y || 500;
			this.height = height || 10;
			this.width = width || 100;
			this.movingRight = false;
			this.movingLeft = false;
			this.leftControl = leftControl || 'a';
			this.rightControl = rightControl || 'd';
			this.rebounceRatio = rebounceRatio || 2;
			this.score = 0;
			game.players.push(this);
		}
		draw(){
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
		updateMove(){
			if(this.movingLeft){
				if(this.x >= 5){
					this.x -= 5;
				}
				else{
					this.x = 0;
				}
			}
			else if(this.movingRight){
				if(this.x + this.width <= canvas.width - 5){
					this.x += 5;
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
}

class Ball{
	constructor(x, y, r){
		this.x = x || Math.floor(Math.random()*canvas.width-5)+5;
		this.y = y || 100;
		this.r = r || 5;
		this.xSpeed = Math.random()-0.5; // between 0 && 1
		this.ySpeed = -1;	//should be 1 / -1 
		game.balls.push(this);
	}
	update(){
		if(!game.pause){
			this.x += this.xSpeed * game.gameSpeed;
			this.y -= this.ySpeed * game.gameSpeed;
			if(this.x + this.r + this.xSpeed >= canvas.width){	//right wall
				this.xSpeed = -Math.abs(this.xSpeed);
			}
			if(this.x - this.r + this.xSpeed <= 0){	//left wall
				this.xSpeed = Math.abs(this.xSpeed);
			}
			if(this.y - this.r <= 0 - this.ySpeed){	//if ball is game space
				this.y = 1 + this.r;
				this.ySpeed = -this.ySpeed;
				if(game.mode == 'arcanoid'){
					game.rebounds += 1;
				}
				else{
				//player.score += 1;
					let log = document.createElement('p');
					log.innerText = `Lower player scored point`;
					mainWindow.appendChild(log);
					this.y = canvas.height/2 - this.r/2;
				}
			}
				//losing (below)
			if(this.y > canvas.height){
				this.y = canvas.height/2 + this.r;
				this.ySpeed = -this.ySpeed;
				game.rebounds = 0;
				if(game.mode === 'pong'){
					//player2.score += 1;
					let log = document.createElement('p');
					log.innerText = `Upper player scored point`;
					mainWindow.appendChild(log);
				}
			}
		}
	};
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
	}

	checkBall(){
		if(this.alive){
			game.balls.forEach(ball =>{
				if(ball.x + ball.r + ball.xSpeed >= this.x && ball.x - ball.r - ball.xSpeed <= this.x + this.width && ball.y + ball.r + ball.ySpeed >= this.y && ball.y + ball.r + ball.ySpeed <= this.y + this.height){
					ball.ySpeed = -ball.ySpeed;
					console.log('hit');
					this.die();
				}
			});
		}
	}
}

const game = {
	gameFps: 60,
	gameSpeed: 5,
	pause:false,
	platforms:[],
	mode:'pong',
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
		if(specific){
			document.addEventListener('keydown', function(e){	//moving
				if(e.key == specific.leftControl){
					specific.moveLeft();
				}
				if(e.key == player.rightControl){
					specific.moveRight();
				}
			});
		}
		else{
			game.players.forEach(player =>{	//setting controls for players
				document.addEventListener('keydown', function(e){	//moving
					if(e.key.toLowerCase() == player.leftControl){
						player.moveLeft();
					}
					if(e.key.toLowerCase() == player.rightControl){
						player.moveRight();
					}
				});

				document.addEventListener('keyup', function(e){	//moving
					if(e.key.toLowerCase() == player.leftControl){
						player.stopLeft();
					}
					if(e.key.toLowerCase() == player.rightControl){
						player.stopRight();
					}
				});
			});
		}
	},
	//refreshing each frame
	main: function(){
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
			});
			player.updateMove();
			player.draw();
		});
		//balls
		this.balls.forEach(ball =>{
			ball.drawBall();
			ball.update();
		});
		//platforms
		game.platforms.forEach(platform =>{
			platform.draw();
			platform.checkBall();
		});
	},
	//clicking start button
	start: function(){
		if(this.working){
			clearInterval(this.working);
		}

		canvas.style.borderTop = 'none';

		//setting arcanoid
		if(game.mode == 'arcanoid'){
			//clearing and creating just one player
			canvas.style.borderTop = 'solid';
			game.clearAllPlayers();
			new Player();
			//creating platforms
			for(var i = 0; i < 9; i++){
				for(var j = 0; j < 4; j++){
					new Platform(i*55 + 5, j*25, null, null, `hsl(${i*10*j*10}, 100%, 50%)`);
				}
			}
		}
		else{
			game.clearAllPlayers();
			new Player();
			new Player(null, 50, null, null, null, 'arrowleft', 'arrowright');
		}

		game.setControls();	//setting controls

		this.working = setInterval(function(){ //interval for each frame
			game.main();
		}, 1000/game.gameFps);
	},
}

startButton.addEventListener('click', game.start);

new Ball();