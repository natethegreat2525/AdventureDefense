"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
	type = "canvas";
}

PIXI.utils.sayHello(type);
//Create a Pixi Application
var app = new PIXI.Application({
	width: 256, // default: 800
	height: 256, // default: 600
	antialias: true, // default: false
	transparent: false, // default: false
	resolution: 1 // default: 1
});

var testClass = function () {
	function testClass() {
		_classCallCheck(this, testClass);
	}

	_createClass(testClass, [{
		key: "testMethod",
		value: function testMethod(a) {
			console.log("Success");
		}
	}]);

	return testClass;
}();

var v = new testClass();
v.testMethod("a");

app.renderer.backgroundColor = 0x061639;

app.renderer.autoResize = true;
app.renderer.resize(512, 512);

//app.renderer.view.style.position = "absolute";
//app.renderer.view.style.display = "block";
//app.renderer.autoResize = true;
//app.renderer.resize(window.innerWidth, window.innerHeight);

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

var rightKey = keyboard(39);
var leftKey = keyboard(37);
var upKey = keyboard(38);
var downKey = keyboard(40);

PIXI.loader.add("images/cat.png").load(setup);

var cat = null;
//This `setup` function will run when the image has loaded
function setup() {

	//Create the cat sprite
	cat = new PIXI.Sprite(PIXI.loader.resources["images/cat.png"].texture);
	cat.position.set(10, 10);
	cat.anchor.set(.5, .5);
	cat.rotation = 5;
	cat.scale.set(.5, 2);
	//Add the cat to the stage
	app.stage.addChild(cat);
	app.ticker.add(function (delta) {
		return gameLoop(delta);
	});
}

function gameLoop(delta) {

	//Move the cat 1 pixel 
	if (rightKey.isDown) cat.x += delta;
}

function keyboard(keyCode) {
	var key = {};
	key.code = keyCode;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;
	//The `downHandler`
	key.downHandler = function (event) {
		if (event.keyCode === key.code) {
			if (key.isUp && key.press) key.press();
			key.isDown = true;
			key.isUp = false;
		}
		event.preventDefault();
	};

	//The `upHandler`
	key.upHandler = function (event) {
		if (event.keyCode === key.code) {
			if (key.isDown && key.release) key.release();
			key.isDown = false;
			key.isUp = true;
		}
		event.preventDefault();
	};

	//Attach event listeners
	window.addEventListener("keydown", key.downHandler.bind(key), false);
	window.addEventListener("keyup", key.upHandler.bind(key), false);
	return key;
}
