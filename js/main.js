
let rightKey = keyboard(39);
let leftKey = keyboard(37);
let upKey = keyboard(38);
let downKey = keyboard(40);

let leftMouseDown = false;
let rightMouseDown = false;


class Inventory {
	constructor() {
		this.contents = {};
	}
	
	add(val) {
		if (!this.contents[val]) {
			this.contents[val] = 0;
		}
		this.contents[val]++;
	}
	
	has(val) {
		return this.contents[val];
	}
	
	use(val) {
		if (!this.contents[val]) {
			return false;
		}
		this.contents[val]--;
		if (this.contents[val] === 0) {
			delete this.contents[val];
		}
		return true;
	}
	
	render(cont, guiCont) {
		guiCont.addChild(makeInventory(this.contents));
	}
	
	update () {
		
	}
}

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
		this.cooldown = 0;
		
		this.stationary = false;
		this.inventory = new Inventory()
		this.inventory.add("WOOD");
		this.inventory.add("WOOD");
		this.inventory.add("WOOD");
		this.inventory.add("STONE");
		this.inventory.add("COAL");
		this.inventory.use("WOOD");
	}
	
	render(cont, guiCont) {
		cont.addChild(makePlayer(this.x, this.y, this.dir, this.fr, this.cooldown/30));
		this.inventory.render(cont, guiCont);
	}
	
	update(delta) {
		this.cooldown -= delta;
		this.cooldown = Math.max(this.cooldown, 0);
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

const enemyParams = [
	[1, 0x005500, .5, .5, .5],
	[3, 0x550000, .5, .5, .5],
	[6, 0x000055, .5, .5, .5],
	[10, 0x008888, 1, .5, 1],
	[20, 0x880088, .5, 1, 1],
	[40, 0x888800, .7, .7, 1]
]

class Enemy {
	constructor(x, y, type) {
		let params = enemyParams[type];
		this.health = params[0];
		this.col = params[1];
		this.sx = params[2];
		this.sy = params[3];
		this.spd = params[4];
		
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.z = 0;
		this.dir = 3;
		this.fr = 0;
		this.type = "ENEMY";
		this.pathIdx = 1;
		this.hitBox = {
			w: 22 * this.sx,
			h: 6
		};
		this.stationary = false;
	}
	
	render(cont) {
		cont.addChild(makeEnemy(this.x, this.y, this.dir, this.fr, this.col, this.sx, this.sy));
	}
	
	update(delta, world) {
		let pathPt = {};
		Object.assign(pathPt, world.path[this.pathIdx]);
		pathPt.x = pathPt.x * 32 + 16;
		pathPt.y = pathPt.y * 32 + 16;

		let right, left, up, down;
		if (Math.abs(pathPt.x - this.x) > Math.abs(pathPt.y - this.y)) {
			right = pathPt.x > this.x;
			left = pathPt.x < this.x;
		} else {
			up = pathPt.y < this.y;
			down = pathPt.y > this.y;
		}
		
		if (Math.abs(pathPt.x - this.x) + Math.abs(pathPt.y - this.y) < 3) {
			this.pathIdx++;
		}
		
		let mv = false;
		this.vx = 0;
		this.vy = 0;

		if (up) {
			this.dir = 1;
			this.vy += -1;
			mv = true;
		}
		if (right) {
			this.dir = 2;
			this.vx += 1;
			mv = true;
		}
		if (left) {
			this.dir = 0;
			this.vx += -1;
			mv = true;
		}
		if (down) {
			this.dir = 3;
			this.vy += 1;
			mv = true;
		}
		if (mv) {
			if (this.vx * this.vy !== 0) {
				this.vx /= Math.sqrt(2);
				this.vy /= Math.sqrt(2);
			}
			this.x += this.vx * this.spd * delta;
			this.y += this.vy * this.spd * delta;
			this.fr += delta;
		} else {
			this.fr = 0;
		}
	}
}

class Tree {
	constructor(x, y) {
		this.x = x;
		this.health = 10;
		this.y = y;
		this.z = 0;
		this.type = "TREE";
		this.hitBox = {
			w: 6,
			h: 6
		};
		this.stationary = true;
		this.inRange = true;
	}
	
	render(cont) {
		let sp = makeTree(this.x, this.y, this.health/10);
		if (this.inRange) {
			sp.interactive = true;
			sp.buttonMode = true;
			sp.on("pointerdown", () => {this.onClick()});
		}
		cont.addChild(sp);
	}
	
	onClick() {
		this.clickedLast = true;
	}
	
	update(delta, world) {
		let dist = Math.abs(world.player.x - this.x) + Math.abs(world.player.y - this.y);
		this.inRange = false;
		if (dist < 32) {
			this.inRange = true;
		}
		if (this.clickedLast) {
			this.clickedLast = false;
			world.treeClicked(this);
		}
		return;
	}
}

let oreProps = [
	["STONE", 10, 0x666666, 0x777777, 0x888888],
	["COAL", 20, 0x000000, 0x111111, 0x222222],
	["METAL", 40, 0xbbbbbb, 0xcccccc, 0xdddddd],
	["CRYSTAL", 80, 0xdd0000, 0xee0000, 0xff0000],
];

class Stone {
	constructor(x, y, t) {
		let p = oreProps[t];
		
		this.x = x;
		
		this.health = p[1];
		this.maxHealth = p[1];
		
		this.c1 = p[2];
		this.c2 = p[3];
		this.c3 = p[4];
		
		this.y = y;
		this.z = 0;
		this.type = p[0];
		this.hitBox = {
			w: 18,
			h: 6
		};
		this.stationary = true;
		this.inRange = true;
	}
	
	render(cont) {
		let sp = makeStone(this.x, this.y, this.health/this.maxHealth, this.c1, this.c2, this.c3);
		if (this.inRange) {
			sp.interactive = true;
			sp.buttonMode = true;
			sp.on("pointerdown", () => {this.onClick()});
		}
		cont.addChild(sp);
	}
	
	onClick() {
		this.clickedLast = true;
	}
	
	update(delta, world) {
		let dist = Math.abs(world.player.x - this.x) + Math.abs(world.player.y - this.y);
		this.inRange = false;
		if (dist < 32) {
			this.inRange = true;
		}
		if (this.clickedLast) {
			this.clickedLast = false;
			world.stoneClicked(this);
		}
		return;
	}
}

class House {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.z = 0;
		this.type = "HOUSE";
		this.hitBox = {
			w: 64,
			h: 6
		};
		this.stationary = true;
	}
	
	render(cont) {
		cont.addChild(makeHouse(this.x, this.y));
	}
	
	update(delta) {
		return;
	}
}

class EntityWave {
	constructor() {
		this.timer = 0;
		this.space = 60;
		this.count = 0;
	}
	
	render() {}
	update(delta, world) {
		this.timer += delta;
		if (this.timer > this.space && this.count < 10) {
			this.timer -= this.space;
			let st = world.path[0];
			this.count++;
			world.entities.push(new Enemy(st.x * 32 + 16, st.y * 32 + 16, 5));
		}
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
		this.entities.push(new House(path[path.length - 1].x * 32 + 16, path[path.length - 1].y * 32 + 16));
		this.player = new Player(path[path.length - 1].x * 32, path[path.length - 1].y * 32)
		this.entities.push(this.player);
		for (let i = 0; i < 100; i++) {
			let x = Math.floor(Math.random() * width);
			let y = Math.floor(Math.random() * height);
			if (this.map[x][y] == 0) {
				this.entities.push(new Tree(32 * x + 16 + Math.random() * 10 - 5, 32 * y + 16 + Math.random() * 10 - 5));
			}
		}
		for (let i = 0; i < 10; i++) {
			let x = Math.floor(Math.random() * width);
			let y = Math.floor(Math.random() * height);
			if (this.map[x][y] == 0) {
				this.entities.push(new Stone(32 * x + 16 + Math.random() * 10 - 5, 32 * y + 16 + Math.random() * 10 - 5, Math.floor(Math.random() * 4)));
			}
		}
		this.entities.push(new EntityWave());
	}
	
	treeClicked(tree) {
		if (this.player.cooldown > 0) {
			return;
		}
		this.player.cooldown = 30;
		
		let hits = 1;
		let wAxe = this.player.inventory.has("WOODEN AXE");
		let sAxe = this.player.inventory.has("STONE AXE");
		let mAxe = this.player.inventory.has("METAL AXE");
		if (wAxe) {
			hits = 2;
		}
		if (sAxe) {
			hits = 5;
		}
		if (mAxe) {
			hits = 11;
		}
		tree.health -= hits;
		if (tree.health <= 0) {
			tree.remove = true;
			this.player.inventory.add("WOOD");
		}
	}
	
	stoneClicked(stone) {
		if (this.player.cooldown > 0) {
			return;
		}
		this.player.cooldown = 30;
		
		let hits = 8;
		let wPick = this.player.inventory.has("WOODEN PICK");
		let sPick = this.player.inventory.has("STONE PICK");
		let mPick = this.player.inventory.has("METAL PICK");
		if (wPick) {
			hits = 2;
		}
		if (sPick) {
			hits = 5;
		}
		if (mPick) {
			hits = 10;
		}
		stone.health -= hits;
		if (stone.health <= 0) {
			stone.remove = true;
			this.player.inventory.add(stone.type);
		}
	}
	
	updateEntities(delta) {
		for (let i = 0; i < this.entities.length; i++) {
			this.entities[i].update(delta, this);
			if (this.entities[i].remove) {
				this.entities.splice(i, 1);
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
		if (this.guiCont) {
			stage.removeChild(this.guiCont);
		}
		
		this.entityCont = new PIXI.Container();
		this.guiCont = new PIXI.Container();
		
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
			this.entities[i].render(this.entityCont, this.guiCont);
		}
		stage.addChild(this.entityCont);
		stage.addChild(this.guiCont);
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

function makeInventory(cont) {
	let c = new PIXI.Container();
	let style = new PIXI.TextStyle({
		fontSize: 20,
		fontWeight: "bold",
		fill: "#dddddd"
	});
	let cnt = 0;
	for (let prop in cont) {
		let txt = new PIXI.Text(prop + ": " + cont[prop], style);
		txt.x = 5;
		txt.y = cnt * 20;
		c.addChild(txt);
		cnt++;
	}
	return c;
}

function makeTree(x, y, health) {
	let trunk = makeRect(6, 32, 0x231709, 13, -16);
	let l1 = makeRect(6, 6, 0x007500, 13, -16);
	let l2 = makeRect(12, 6, 0x006500, 10, -10);
	let l3 = makeRect(18, 6, 0x005500, 7, -4);
	let l4 = makeRect(24, 6, 0x004500, 4, 2);
	let healthRed = makeRect(24, 3, 0xff0000, 4, -23);
	let healthGreen = makeRect(24*health, 3, 0x00ff00, 4, -23);
	let c = new PIXI.Container();
	c.addChild(trunk, l1, l2, l3, l4);
	if (health < .99) {
		c.addChild(healthRed, healthGreen);
	}
	c.x = x-16;
	c.y = y-16;
	return c;
}

function makeStone(x, y, health, c1, c2, c3) {
	let r1 = makeRect(9, 9, c2, 0, -9);
	let r2 = makeRect(9, 9, c1, 9, -7);
	let r3 = makeRect(9, 9, c3, 5, -15);
	let healthRed = makeRect(24, 3, 0xff0000, 0, -20);
	let healthGreen = makeRect(24*health, 3, 0x00ff00, 0, -20);
	let c = new PIXI.Container();
	c.addChild(r3, r2, r1);
	if (health < .99) {
		c.addChild(healthRed, healthGreen);
	}
	c.x = x-9;
	c.y = y;
	return c;
}

function makeHouse(x, y) {
	let body = makeRect(64, 32, 0xaaaaaa, -32, -32);
	let r1 = makeRect(70, 6, 0xaa0000, -35, -32);
	let r2 = makeRect(60, 6, 0xbb0000, -30, -38);
	let r3 = makeRect(50, 6, 0xcc0000, -25, -44);
	let r4 = makeRect(40, 6, 0xdd0000, -20, -50);
	let door = makeRect(10, 16, 0x000000, -5, -16);
	let c = new PIXI.Container();
	c.addChild(body, r1, r2, r3, r4, door);
	c.x = x;
	c.y = y;
	return c;
}

function makePlayer(x, y, dir, fr, cooldown) {
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
	
	if (cooldown > 0) {
		let cdBar = makeRect(24*cooldown, 3, 0x5555ff, -1, -5);
		c.addChild(cdBar);
	}
	c.x = x-11;
	c.y = y-22;
	return c;
}

function makeEnemy(x, y, dir, fr, col, sx, sy) {
	let body = makeRect(20, 20, col, 1, 1);
	let outline = makeRect(22, 22, 0x000000, 0, 0);
	
	let lFoot = null;
	let rFoot = null;
	if (dir == 0 || dir == 2) {
		let fcx = 9;
		let fcy = 23;
		let ox = Math.sin((fr + 4) / 5) * 6;
		lFoot = makeRect(3, 3, col, fcx + ox, fcy);
		rFoot = makeRect(3, 3, col, fcx - ox, fcy);
	} else {
		let fcx = 9;
		let fcy = 22;
		let oy = Math.sin(fr / 5) * 1;
		lFoot = makeRect(3, 3, col, fcx + 6, fcy + oy);
		rFoot = makeRect(3, 3, col, fcx - 6, fcy - oy);
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
	c.x = -11;
	c.y = -22;
	let c2 = new PIXI.Container();
	c2.addChild(c);
	c2.scale.x = sx;
	c2.scale.y = sy;
	c2.x = x;
	c2.y = y;
	return c2;
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