
let rightKey = keyboard(39);
let leftKey = keyboard(37);
let upKey = keyboard(38);
let downKey = keyboard(40);

let leftMouseDown = false;
let rightMouseDown = false;


class Player {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.z = 0;
		this.dir = 3;
		this.fr = 0;
		this.type = "PLAYER";
		this.hitBox = {
			w: 22,
			h: 6
		};
		this.stationary = false;
	}
	
	render(cont) {
		cont.addChild(makePlayer(this.x, this.y, this.dir, this.fr));
	}
	
	update(delta) {
		let mv = false;
		let spd = 1.5;
		this.vx = 0;
		this.vy = 0;

		if (upKey.isDown) {
			this.dir = 1;
			this.vy += -1;
			mv = true;
		}
		if (rightKey.isDown) {
			this.dir = 2;
			this.vx += 1;
			mv = true;
		}
		if (leftKey.isDown) {
			this.dir = 0;
			this.vx += -1;
			mv = true;
		}
		if (downKey.isDown) {
			this.dir = 3;
			this.vy += 1;
			mv = true;
		}
		if (mv) {
			if (this.vx * this.vy !== 0) {
				this.vx /= Math.sqrt(2);
				this.vy /= Math.sqrt(2);
			}
			this.x += this.vx * spd * delta;
			this.y += this.vy * spd * delta;
			this.fr += delta;
		} else {
			this.fr = 0;
		}
	}
}

class Tree {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.z = 0;
		this.type = "TREE";
		this.hitBox = {
			w: 6,
			h: 6
		};
		this.stationary = true;
	}
	
	render(cont) {
		cont.addChild(makeTree(this.x, this.y));
	}
	
	update(delta) {
		return;
	}
}

class World {

	constructor(width, height, path) {
		this.width = width;
		this.height = height;
		this.map = [];
		for (let i = 0; i < width; i++) {
			this.map.push([]);
			for (let j = 0; j < height; j++) {
				this.map[i].push(0);
			}
		}
		this.path = path;
		for (let i = 0; i < path.length - 1; i++) {
			let s = path[i];
			let e = path[i+1];
			let d = Math.abs(s.x - e.x) + Math.abs(s.y - e.y);
			for (let j = 0; j <= d; j++) {
				let jd = j / d;
				let dj = 1 - jd;
				let px = Math.floor(s.x * jd + e.x * dj + .5);
				let py = Math.floor(s.y * jd + e.y * dj + .5);
				this.map[px][py] = 1;
			}
		}
		this.entities = [];
		this.entities.push(new Player(path[path.length - 1].x * 32, path[path.length - 1].y * 32));
		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 10; j++) {
				this.entities.push(new Tree(32 * i + 32 + Math.random() * 30, 32 * j + 32 + Math.random() * 30));
			}
		}
	}
	
	updateEntities(delta) {
		for (let i = 0; i < this.entities.length; i++) {
			this.entities[i].update(delta);
			if (this.entities[i].remove) {
				entities.splice(i, 1);
				i--;
			}
		}
		for (let i = 0; i < this.entities.length; i++) {
			let ie = this.entities[i];
			if (ie.hitBox) {
				for (let j = i + 1; j < this.entities.length; j++) {
					let je = this.entities[j];
					if (je.hitBox) {
						let dx = ie.x - je.x;
						let dy = ie.y - je.y;
						let dxa = Math.abs(dx);
						let dya = Math.abs(dy);
						let tw = (ie.hitBox.w + je.hitBox.w) / 2;
						let th = (ie.hitBox.h + je.hitBox.h) / 2;
						if (dxa < tw && dya < th) {
							//collision
							if (tw - dxa < th - dya) {
								//correct x
								let cx = (tw - dxa);
								if (!je.stationary && !ie.stationary) {
									cx *= 2;
								}
								if (!ie.stationary) {
									ie.x += Math.sign(dx) * cx;
								}
								if (!je.stationary) {
									je.x -= Math.sign(dx) * cx;
								}
							} else {
								//correct y
								let cy = (th - dya);
								if (!je.stationary && !ie.stationary) {
									cy *= 2;
								}
								if (!ie.stationary) {
									ie.y += Math.sign(dy) * cy;
								}
								if (!je.stationary) {
									je.y -= Math.sign(dy) * cy;
								}
							}
						}
					}
				}
			}
		}
	}
	
	renderEntities(stage) {
		if (this.entityCont) {
			stage.removeChild(this.entityCont);
		}
		
		this.entityCont = new PIXI.Container();
		
		//TODO sort entities by dist
		this.entities.sort((a, b) => {
			if (a.y < b.y) {
				return -1;
			}
			if (a.y > b.y) {
				return 1;
			}
			return 0;
		});
		for (let i = 0; i < this.entities.length; i++) {
			this.entities[i].render(this.entityCont);
		}
		stage.addChild(this.entityCont);
	}
	
	updateGroundCont(stage) {
		if (this.groundCont) {
			stage.removeChild(this.groundCont);
		}
		
		this.groundCont = new PIXI.Container();
		
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				this.groundCont.addChild(makeTile(this.map[i][j], i * 32, j * 32))
			}
		}
		stage.addChild(this.groundCont);
	}
}

let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
	type = "canvas"
}

PIXI.utils.sayHello(type)
//Create a Pixi Application
let app = new PIXI.Application({ 
		width: 800,				// default: 800
		height: 600,			// default: 600
		antialias: true,		// default: false
		transparent: false, 	// default: false
		resolution: 1			// default: 1
	}
);

app.renderer.backgroundColor = 0x061639;

app.renderer.autoResize = true;
//app.renderer.resize(512, 512);

let mousePos = app.renderer.plugins.interaction.mouse.global;
console.log(app.renderer.plugins.interaction)
//app.renderer.view.style.position = "absolute";
//app.renderer.view.style.display = "block";
//app.renderer.autoResize = true;
//app.renderer.resize(window.innerWidth, window.innerHeight);

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//prevent right click menu
app.view.addEventListener('contextmenu', (e) => { e.preventDefault(); });


app.renderer.plugins.interaction.on("pointerdown", (t) => {
	if (t.data.button == 0) {
		leftMouseDown = true
	}
	if (t.data.button == 2) {
		rightMouseDown = true
	}
});
app.renderer.plugins.interaction.on("pointerup", (t) => {
	if (t.data.button == 0) {
		leftMouseDown = false
	}
	if (t.data.button == 2) {
		rightMouseDown = false
	}
});

let world = null;

PIXI.loader
	.load(setup);


//This `setup` function will run when the image has loaded
function setup() {
	let path = [
		{x:5, y:0},
		{x:5, y:4},
		{x:2, y:4},
		{x:2, y:13},
		{x:10, y:13},
		{x:10, y:3},
		{x:21, y:3},
		{x:21, y:13},
		{x:15, y:13},
		{x:15, y:8}
	];
	world = new World(24, 16, path);

	world.updateGroundCont(app.stage);
	//app.stage.addChild(greenRect);
	app.ticker.add(delta => gameLoop(delta));
}

function makeTile(idx, x, y) {
	switch(idx){
		case 0:
			return makeRect(32, 32, 0x00ae00, x, y);
		case 1:
			return makeRect(32, 32, 0x795c34, x, y);
	}
}

function makeTree(x, y) {
	let trunk = makeRect(6, 32, 0x231709, 13, -16);
	let l1 = makeRect(6, 6, 0x007500, 13, -16);
	let l2 = makeRect(12, 6, 0x006500, 10, -10);
	let l3 = makeRect(18, 6, 0x005500, 7, -4);
	let l4 = makeRect(24, 6, 0x004500, 4, 2);
	let c = new PIXI.Container();
	c.addChild(trunk, l1, l2, l3, l4);
	c.x = x-16;
	c.y = y-16;
	return c;
}

function makePlayer(x, y, dir, fr) {
	let body = makeRect(20, 20, 0xffffff, 1, 1);
	let outline = makeRect(22, 22, 0x000000, 0, 0);
	
	let lFoot = null;
	let rFoot = null;
	if (dir == 0 || dir == 2) {
		let fcx = 9;
		let fcy = 23;
		let ox = Math.sin((fr + 4) / 5) * 6;
		lFoot = makeRect(3, 3, 0xffffff, fcx + ox, fcy);
		rFoot = makeRect(3, 3, 0xffffff, fcx - ox, fcy);
	} else {
		let fcx = 9;
		let fcy = 22;
		let oy = Math.sin(fr / 5) * 1;
		lFoot = makeRect(3, 3, 0xffffff, fcx + 6, fcy + oy);
		rFoot = makeRect(3, 3, 0xffffff, fcx - 6, fcy - oy);
	}
	
	let c = new PIXI.Container();
	c.addChild(lFoot, rFoot, outline, body);
	
	if (dir == 0) {
		let eye = makeRect(5, 5, 0x000000, 1, 5);
		c.addChild(eye);
	}
	
	if (dir == 2) {
		let eye = makeRect(5, 5, 0x000000, 16, 5);
		c.addChild(eye);
	}
	
	if (dir == 3) {
		let leye = makeRect(5, 5, 0x000000, 2, 5);
		let reye = makeRect(5, 5, 0x000000, 15, 5);
		c.addChild(leye);
		c.addChild(reye);
	}
	c.x = x-11;
	c.y = y-22;
	return c;
}

function makeRect(w, h, tint, x, y) {
	s = new PIXI.Sprite(PIXI.Texture.WHITE);
	s.tint = tint;
	s.width = w;
	s.height = h;
	if (typeof x !== 'undefined') {
		s.x = x;
		s.y = y;
	}
	return s;
}

function gameLoop(delta){
	world.updateEntities(delta);
	world.renderEntities(app.stage);

}





function keyboard(keyCode) {
	let key = {};
	key.code = keyCode;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;
	//The `downHandler`
	key.downHandler = event => {
		if (event.keyCode === key.code) {
			if (key.isUp && key.press) key.press();
			key.isDown = true;
			key.isUp = false;
		}
		event.preventDefault();
	};

	//The `upHandler`
	key.upHandler = event => {
		if (event.keyCode === key.code) {
			if (key.isDown && key.release) key.release();
			key.isDown = false;
			key.isUp = true;
		}
		event.preventDefault();
	};

	//Attach event listeners
	window.addEventListener(
		"keydown", key.downHandler.bind(key), false
	);
	window.addEventListener(
		"keyup", key.upHandler.bind(key), false
	);
	return key;
}