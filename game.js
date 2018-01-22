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

const player = {	//TODO: swap to class
	x: 50,
	y: 500,
	height:10,
	width: 100,
	movingRight: false,
	movingLeft: false,
	rebounceRatio: 2,
	score: 0,
	draw: function(){
		ctx.fillRect(this.x, this.y, this.width, this.height);
	},
	updateMove: function(){
		if(player.movingLeft){
			if(player.x >= 5){
				player.x -= 5;
			}
			else{
				player.x = 0;
			}
		}
		else if(player.movingRight){
			if(player.x + player.width <= canvas.width - 5){
				player.x += 5;
			}
			else{
				player.x = canvas.width - player.width;
			}
		}
	},

	pressKey: function(e){
		if(e.key === 'd'.toLowerCase()){;
			player.movingRight = true;
		}
		else if(e.key === 'a'.toLowerCase()){
			player.movingLeft = true;
		}
	},
	upKey: function(e){
		if(e.key === 'd'.toLowerCase()){
			player.movingRight = false;
		}
		if(e.key === 'a'.toLowerCase()){
			player.movingLeft = false;
		}
	}

}

const player2 = {	//TODO: swap to class
	x: 50,
	y: 20,
	height:10,
	width: 100,
	movingRight: false,
	movingLeft: false,
	rebounceRatio: 2,
	score: 0,
	draw: function(){
		ctx.fillRect(this.x, this.y, this.width, this.height);
	},
	updateMove: function(){
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
	},

	pressKey: function(e){
		if(e.key === 'ArrowRight'){;
			player2.movingRight = true;
		}
		else if(e.key === 'ArrowLeft'){
			player2.movingLeft = true;
		}
	},
	upKey: function(e){
		if(e.key === 'ArrowRight'){
			player2.movingRight = false;
		}
		if(e.key === 'ArrowLeft'){
			player2.movingLeft = false;
		}
	}

}


const ball = {
	x:Math.floor(Math.random()*canvas.width-5)+5,
	y:100,
	r:5,
	xSpeed: Math.random()-0.5, // between 0 && 1
	ySpeed: -1,	//should be 1 / -1 
	update: function(){
		if(!game.pause){
			this.x += this.xSpeed * game.gameSpeed;
			this.y -= this.ySpeed * game.gameSpeed;
			if(this.x + this.r + this.xSpeed >= canvas.width){	//right wall
				this.xSpeed = -Math.abs(this.xSpeed);
			}

			if(this.x - this.r + this.xSpeed <= 0){	//left wall
				this.xSpeed = Math.abs(this.xSpeed);
			}

			if(this.y - this.r <= 0 - this.ySpeed){	//if ball is above
				this.y = 1 + this.r;
				if(game.mode == 'arcanoid'){			//arcanoid
					game.rebounds += 1;
					this.ySpeed = -this.ySpeed;
				}
				else{									//pong
					player.score += 1;
					let log = document.createElement('p');
					log.innerText = `Lower player scored point`;
					mainWindow.appendChild(log);
					this.ySpeed = -this.ySpeed;
					this.y = canvas.height/2 - this.r/2;
				}
			}
			//losing
			if(this.y > canvas.height){
				this.y = canvas.height/2 + this.r;
				this.ySpeed = -ball.ySpeed;
				game.rebounds = 0;

				if(game.mode === 'pong'){
					player2.score += 1;
					let log = document.createElement('p');
					log.innerText = `Upper player scored point`;
					mainWindow.appendChild(log);
				}
			}
		}
	},
	lookForPlayerRebounce: function(player){
		if(ball.y + ball.r >= player.y && ball.y - ball.r <= player.y + player.height && ball.x + ball.r + 2 >= player.x && ball.x - ball.r - 2 <= player.x+player.width){
			ball.xSpeed = (((ball.x - player.x)-50)/player.width)*player.rebounceRatio;
			ball.ySpeed = -ball.ySpeed;
		}
	},

	drawBall: function(){
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
		ctx.stroke();
	}
}

class Platform{
	constructor(x, y, width, height, color, special){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.alive = true;
		if(!this.width || !this.height){	//default values for platform
			this.width = this.width || 50;
			this.height = this.height || 20;
		}

		this.color = color;
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
			if(ball.x + ball.r + ball.xSpeed >= this.x && ball.x - ball.r - ball.xSpeed <= this.x + this.width && ball.y + ball.r + ball.ySpeed >= this.y && ball.y + ball.r + ball.ySpeed <= this.y + this.height){
				ball.ySpeed = -ball.ySpeed;
				this.die();
			}
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
	players:[player, player2],

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
	//refreshing each frame
	main: function(){	//main functions
		ctx.clearRect(0, 0, canvas.width, canvas.height);	//clearing screen for new frame
		this.activeTexts.forEach(arrItem =>{	//texts
			game.showSomeText(arrItem.text, arrItem.x, arrItem.y);
		});

		this.players.forEach(player =>{	//player collision with ball
			ball.lookForPlayerRebounce(player);
		});

		player.updateMove();
		ball.drawBall();
		ball.update();
		player.draw();

		if(this.mode == 'pong'){
			player2.updateMove();
			player2.draw();
		}

		game.platforms.forEach(platform =>{
			platform.draw();
			platform.checkBall();
		});
	},

	start: function(){
		player2.x = 50;
		canvas.style.borderTop = 'none';
		if(this.working){
			clearInterval(this.working);
		}
		//setting arcanoid
		if(game.mode == 'arcanoid'){
			player2.x = 2000;	//for now
			for(var i = 0; i < 9; i++){
				for(var j = 0; j < 4; j++){
					new Platform(i*55 + 5, j*25, null, null, `hsl(${i*10*j*10}, 100%, 50%)`);
				}
			}
		}

		document.addEventListener('keydown', player.pressKey);
		document.addEventListener('keyup', player.upKey);
		if(game.mode === 'pong'){
			document.addEventListener('keydown', player2.pressKey);
			document.addEventListener('keyup', player2.upKey);
		}
		this.working = setInterval(function(){ //here comes the main part
		game.main();

		}, 1000/game.gameFps);
	},

	stop: function(){
		clearInterval(this.working);
	}
}

startButton.addEventListener('click', game.start);