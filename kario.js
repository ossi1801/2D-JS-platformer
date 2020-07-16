/*jslint browser:true, bitwise:true */
/*global $, jQuery, alert, LZString, Cookies*/

(function () {
	"use strict";

	var w = 1000,
		h = 600,
		c = document.getElementById("canvas"),
		ctx = c.getContext("2d"),
		vTerminal = -12,
		gravity = 0.5,
		friction = 0.2,
		keyW = false,
		keyA = false,
		keyS = false,
		keyD = false,
		keySpace = false,
		keyEsc = false,
		bgX = 100,
		bgY = 825,
		right = w / 2 + 100,
		left = w / 2 - 100,
		scrollSpeed,
		lastRun,
		kario = new Image(),
		tiili = new Image(),
		desertbg = new Image(),
		snowbg = new Image(),
		lavabg = new Image(),
		forestbg = new Image(),
		castlebg = new Image(),
		cavebg = new Image(),
		ukkeli = new Image(),
		kariohat = new Image(),
		hat = new Image(),
		kariohit = new Image(),
		kariosheet = new Image(),
		ruutulippu = new Image(),
		tippuva = new Image(),
		portal = new Image(),
		kummitus = new Image(),
		kolikko = new Image(),
		currentLevel = 1,
		gameOn = false,
		fpscounter = 0,
		fps,
		graphics = true,
		i,
		a,
		b,
		f,
		d,
		g,
		reqAnimFrame = window.requestAnimationFrame,
		files = [],
		fileCount,
		filesLoaded = 0,
		loadingBarChunk,
		boxes = [],
		player = {},
		dir,
		toggle,
		controlsEnabled = true,
		waitFriction = 0,
		drawn = [],
		score = 0,
		levelScore = 0,
		time,
		timeOn = false;

	c.width = w;
	c.height = h;

	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;

	kario.src = "img/Apinailmanhattua.png";
	tiili.src = "img/tiilismall.png";
	desertbg.src = "img/desertlevel.png";
	snowbg.src = "img/snowlevel.png";
	lavabg.src = "img/tulivuorimap.png";
	forestbg.src = "img/forest.png";
	castlebg.src = "img/spookycastlemaptorch.png";
	cavebg.src = "img/luolabackground.png";
	
	ukkeli.src = "img/ukkeli.png";
	kariohat.src = "img/kariosheet4hattu.png";
	hat.src = "img/hattucrop.png";
	kariohit.src = "img/kariosheet4hit.png";
	kariosheet.src = "img/kariosheet4.png";
	ruutulippu.src = "img/ghost.png";
	tippuva.src = "img/tippuva.png";
	portal.src = "img/portal.png";
	kummitus.src = "img/ghost.png";
	kolikko.src = "img/pienikolikko.png";
	
	files.push(hat);
	files.push(tiili);
	files.push(kario);
	files.push(desertbg);
	files.push(snowbg);
	files.push(forestbg);
	files.push(castlebg);
	files.push(cavebg);
	
	files.push(ukkeli);
	files.push(kariohat);
	files.push(kariohit);
	files.push(kariosheet);
	files.push(portal);
	files.push(kummitus);
	files.push(kolikko);

	function loadingBar() {
		filesLoaded += 1;
		$("#bar").css("width", loadingBarChunk * filesLoaded + "%");
		if (filesLoaded === fileCount) {
			$("#level").css("opacity", 0);
			$("#level").hide();
			$("#logo").css("animation-play-state", "running");
			$("#kario").css("animation-play-state", "running");
		}
	}

	fileCount = files.length;
	loadingBarChunk = Math.ceil(100 / fileCount);
	for (a = 0; a < fileCount; a += 1) {
		files[a].onload = loadingBar();
	}

	function initPlayer() {
		player = {
			x : 0,
			y : -9001,
			w : 80,
			h : 119,
			vX : 0,
			vY : 0,
			moveSpeed : 5,
			onGround : false,
			type : "player",
			sprite : {
				img : kariosheet,
				frames : 4,
				ticks : 5,
				index : 0,
				tick : 0
			},
			hat : false,
			invincible : false,
			flying : false,
			noclip : false
		};
	}

	function initLevel(select) {
		timeOn = true;
		time = 90;
		timeCounter();
		initPlayer();
		player.x = 100;
		player.y = 450;
		bgX = 100;
		bgY = 825;
		boxes = [];
		drawn = [];
		$(".object").remove();
		$("#container").css("background","none");

		if (select === "custom") {

			var levelDataString = $("#custominput").val();
			boxes = JSON.parse(LZString.decompressFromBase64(levelDataString));
			$("#container").css("background", "url(" + desertbg.src + ")");

		} else if (select === 1) {
			//level 1
			boxes.push({
				type : "floor",
				x : 0,
				y : 550,
				w : w,
				h : 10
			});
			boxes.push({
				type : "box",
				x : 720,
				y : 400,
				w : 80,
				h : 80
			});
			boxes.push({
				type : "box",
				x : 500,
				y : 300,
				w : 80,
				h : 10
			});
			boxes.push({
				type : "box",
				x : 450,
				y : 200,
				w : 80,
				h : 80
			});
			boxes.push({
				type : "box",
				x : 670,
				y : 450,
				w : 40,
				h : 40
			});
			boxes.push({
				type : "goal",
				x : 1200,
				y : 500,
				w : 48,
				h : 48
			});
			boxes.push({
				x : 1000,
				y : 480,
				w : 29 * 2,
				h : 35 * 2,
				type : "enemy slider",
				oX : 1000,
				oY : 480,
				d1 : 100,
				d2 : 100,
				vX : 1,
				vY : 0,
				or : "h",
				img : ukkeli
			});
			boxes.push({
				x : 450,
				y : 150,
				w : 100,
				h : 50,
				type : "hat"
			});
			boxes.push({
				x : 900,
				y : 300,
				w : 100,
				h : 20,
				type : "faller",
				vY : 0,
				triggered : false
			});
			boxes.push({
				type : "teleport",
				x : 1000,
				y : 520,
				w : 100,
				h : 30,
				tX : 500,
				tY : 0
			});
			boxes.push({
				type : "coin",
				x : 400,
				y : 100,
				w : 50,
				h : 50
			});

			$("#container").css("background", "url(" + desertbg.src + ")");
			$("#music").attr("src", "snd/Jungle.wav");
			$("#music").load();

		} else if (select === 2) {
			//level 2
			boxes = JSON.parse(LZString.decompressFromBase64("NobwRALgngDgpmAXGARgewB5gDRi4gJgEYBWAZlyiSIA4B2XAdyTKNwAskCAGAgX2zho8JKkw48SAJwA2ApS68m1MjQ4tuAobATJ0WXPiIAWGmzBVC3Y8sRluU9Xc2DIO0fon46ZCha50MrZ0jmCczlpuInrihtQ0JNwKdma2BKlhGpHCumIGknYEcslksrYkDJkRrjkesQU0NH6WxkTmzIhEMmpV9tnuMfn49qXJxvbloeF9NQN5XlwJlS108mAdJObTLtrR83GIdLTJiWsdRARTWbN7ngcEJI8n6Wncftv9t/X4l2uWjyRbKUrtVdrk7gUujIkv5EI9Qh0ZFIQX0ALpAA="));
			boxes.push({
				type : "slider",
				x : 1285,
				y : 200,
				w : 100,
				h : 10,
				oX : 1250,
				oY : 200,
				d1 : 100,
				d2 : 100,
				vX : 0,
				vY : 1,
				or : "v"
			});
			boxes.push({
				type : "goal",
				x : 3500,
				y : 333,
				w : 48,
				h : 48
			});

			$("#container").css("background", "url(" + snowbg.src + ")");

		} else if (select === 3) {
			//level 3
			boxes = JSON.parse(LZString.decompressFromBase64("NobwRALgngDgpmAXGARgewB5gDRi4gRgA4iAGXKJAggdlwHcqAmXACyQGYCA2AX23DR4SVJhx4qATkkswlQgFZyYRoQ50w7Rf0GwEydFlz5a3ZfOJEGnACxskTSTsh6Rh8fiYEmCilNmqBPaITKQKzkL6okYShNJ2clIJgcGhfAIuwgZixg4+vokhNsmcHKk0Ea7ZMZ403AnyTDZWKkg2kqlOGZFuObGOTBqN3AFICkGaDl26WdEeVAo05g40JYgc3KnpM1HuuSEKRLKNRBOqNspaHKSVs3v9Pg2cpKMhwQQvt7t9JjYcZYV/q8Nlsvr0ag52hN5BxmtZ1gCtIMwdV5mpSJtAUQOq11pikdtMt8ISEOEc/IgbAQceccVo/ii5vtaP8KX8CoEzMFpkTwWiWQD5MVMYECloCBdGfd8DRJMtKTYNKpHKkCFKfswXmzuC1lXSHGrulUmbEFJJBW1JGcpqr1SSPhwcfIlDSbZMQoadnz9l4MRSFIN4dT3hUjXcNesmEQCs7A7jrmKkISeqifT5MbHXZSJlcOHa0aFSE6xlwgy1xcnjdKqP7YfCA/q1PnmXVoWNuFnvInEBUALpAA="));

			boxes.push({
				x : 1780,
				y : 510,
				w : 100,
				h : 50,
				type : "hat"
			});
			boxes.push({
				x : 3400,
				y : 527 - 35 * 2,
				w : 29 * 2,
				h : 35 * 2,
				type : "enemy slider",
				oX : 3400,
				oY : 527 - 35 * 2,
				d1 : 100,
				d2 : 100,
				vX : 1,
				vY : 0,
				or : "h",
				img : ukkeli
			});
			boxes.push({
				x : 3700,
				y : 475,
				w : 96,
				h : 96,
				type : "goal"
			});

			$("#container").css("background", "url(" + lavabg.src + ")");

		} else if (select === 4) {
			//level 4
			boxes.push({
				x : 400,
				y : 550,
				w : 100,
				h : 10,
				type : "box"
			});
			boxes.push({
				x : 500,
				y : 500,
				w : 100,
				h : 10,
				type : "slider",
				triggered : false,
				oX : 500,
				oY : 500,
				d1 : 1000,
				d2 : 0,
				vX : 3,
				vY : 0,
				or : "h"
			});
			boxes.push({
				x: 900,
				y: 400,
				w: 600,
				h: 50,
				type: "box"
			});
			boxes.push({
				x: 1050,
				y: 400 - 35 * 2,
				w: 29 * 2,
				h: 35 * 2,
				type: "enemy slider",
				oX: 1050,
				oY: 400 - 35 * 2,
				d1: 100,
				d2: 100,
				vX: 1,
				vY: 0,
				or: "h",
				img: ukkeli
			});
			boxes.push({
				x: 1400,
				y: 400 - 35 * 2,
				w: 29 * 2,
				h: 35 * 2,
				type: "enemy slider",
				oX: 1400,
				oY: 400 - 35 * 2,
				d1: 0,
				d2: 150,
				vX: 2,
				vY: 0,
				or: "h",
				img: ukkeli
			});
			boxes.push({
				x: 1500,
				y: 598,
				w: 200,
				h: 10,
				type: "slider",
				triggered: false,
				oX: 1500,
				oY: 598,
				d1: 0,
				d2: 500,
				vX: 0,
				vY: 3,
				or: "v"
			});
			boxes.push({
				x: 1650,
				y: 100,
				w: 100,
				h: 10,
				type: "slider",
				triggered: false,
				oX: 1650,
				oY: 100,
				d1: 1000,
				d2: 0,
				vX: 4,
				vY: 0,
				or: "h"
			});
			boxes.push({
				x: 2050,
				y: 300,
				w: 100,
				h: 10,
				type: "slider",
				oX: 2050,
				oY: 300,
				d1: 700,
				d2: 0,
				vX: 5,
				vY: 0,
				or: "h"
			});
			boxes.push({
				x: 2050,
				y: 500,
				w: 80,
				h: 10,
				type: "slider",
				oX: 2050,
				oY: 500,
				d1: 200,
				d2: 0,
				vX: 2,
				vY: 0,
				or: "h"
			});
			boxes.push({
				x: 2650,
				y: 550,
				w: 100,
				h: 10,
				type: "slider",
				triggered: false,
				oX: 2650,
				oY: 550,
				d1: 0,
				d2: 600,
				vX: 0,
				vY: 4,
				or: "v"
			});
			for(g = 0; g < 6; g += 1){
				boxes.push({
					x : 3100 + g * 150,
					y : 500 - g * 25,
					w : 100,
					h : 20,
					type : "faller",
					vY : 0,
					triggered : false
				});
			}
			boxes.push({
				x : 3950,
				y : 340,
				w : 60,
				h : 10,
				type : "box"
			});
			boxes.push({
				x : 3950,
				y : 340 - 35 * 2,
				w : 29 * 2,
				h : 35 * 2,
				type : "enemy",
				img: ukkeli
			});
			boxes.push({
				x : 4300,
				y : 540,
				w : 48,
				h : 48,
				type : "goal"
			});
			boxes.push({
				x : 4250,
				y : 580,
				w : 50,
				h : 10,
				type : "box"
			});
			

			$("#container").css("background", "url(" + desertbg.src + ")");
		} else if (select === 5) {
			//level 5
			boxes = JSON.parse(LZString.decompressFromBase64("NobwRALgngDgpmAXGARgewB5gDRi4gZgE4iAGXKJAJlwHckAWXACyQFYiB2AX23GnhJUmHHmoAOAIwUk4ukgKkq5MK0RVe/WAmTosufAQZsCMxJzlh6iYyySTSmyNqF7RhtqQBsZi/MJsTKpIRE4COsL6YoQMJGZS/mx2iGySDGEuuiIGCrGWlIjiRP4+wSneGYJZUYYEXklgBWkq1gyWamyVEW45iF6kKk0c/gTtSF5drtnRVBaD9l7FVgpUNGWSGnzOVZHuSBacZpKcpsspp2oTW+FTNdRzR+IN1qVqDA6T1XuEVAyHjfZxKVWhcQp9dr13vNEJIiJZrKNklctDsetE6mkzFRMWdRqCYZJwWj8ERpAD1FRgfZhutNijutN8JI2KksV4ya0xohQtdMhDopICJx/gUqEVEg01IKiYzqGxZmYCEr/H9kjxeajZdzxCKFEL/FQyMlpRqGXcAqQGgU6ksEbZ1gQZeaxUQrQpOC0QizjYTTbdvlQjPkFOJ4QpXrInQG2rqbF41q1/lLffT/b1OMozPLnuwuSbU19eoGGNCTAn2EFk1HegRPG6Up4VeI1mpxNWBeJa1mTCNOJL7HTtmbvgRJAlyWwvP8ERGYYOboX0UYlgVJ9OFEsq37F4ZSA4s4sRi37I5t/ymUQgquTiMdcb1QXzxJlROb7iyWpQgBdIA=="));

			boxes.push({
				x : 866,
				y : 450,
				w : 100,
				h : 10,
				type : "slider",
				oX : 866,
				oY : 450,
				d1 : 100,
				d2 : 100,
				vX : 0,
				vY : 2,
				or : "v"
			});
			boxes.push({
				x : 2020,
				y : 553 - 35 * 2,
				w : 29 * 2,
				h : 35 * 2,
				type : "enemy slider",
				oX : 2020,
				oY : 553 - 35 * 2,
				d1 : 120,
				d2 : 120,
				vX : 2,
				vY : 0,
				or : "h",
				img : ukkeli
			});
			boxes.push({
				x : 2680,
				y : 366,
				w : 100,
				h : 10,
				type : "slider",
				oX : 2680,
				oY : 366,
				d1 : 150,
				d2 : 200,
				vX : 0,
				vY : 3,
				or : "v"
			});
			boxes.push({
				x : 3420,
				y : 540,
				w : 48,
				h : 48,
				type : "goal"
			});
			boxes.push({
				x : 3180,
				y : 370 - 35 * 2,
				w : 29 * 2,
				h : 35 * 2,
				type : "enemy slider",
				oX : 3180,
				oY : 370 - 35 * 2,
				d1 : 120,
				d2 : 120,
				vX : 2,
				vY : 0,
				or : "h",
				img : ukkeli
			});
			boxes.push({
				x : 3920,
				y : 214 - 35 * 2,
				w : 29 * 2,
				h : 35 * 2,
				type : "enemy slider",
				oX : 3920,
				oY : 214 - 35 * 2,
				d1 : 0,
				d2 : 200,
				vX : 2,
				vY : 0,
				or : "h",
				img : ukkeli
			});
			boxes.push({
				x : 3580,
				y : 370 - 35 * 2,
				w : 29 * 2,
				h : 35 * 2,
				type : "enemy slider",
				oX : 3580,
				oY : 370 - 35 * 2,
				d1 : 200,
				d2 : 0,
				vX : 2,
				vY : 0,
				or : "h",
				img : ukkeli
			});
			boxes.push({
				x : 120,
				y : 176,
				w : 100,
				h : 50,
				type : "hat"
			});
			boxes.push({
				x : 2000,
				y : 150,
				w : 100,
				h : 10,
				type : "box"
			});
			boxes.push({
				x : 2000,
				y : 50,
				w : 10,
				h : 100,
				type : "box"
			});
			boxes.push({
				x : 3550,
				y : 520,
				w : 100,
				h : 30,
				type : "teleport",
				tX : 2135,
				tY : 50
			});

			$("#container").css("background", "url(" + forestbg.src + ")");
		}else if(select === 6){
			//level 6
			boxes = JSON.parse(LZString.decompressFromBase64("NobwRALgngDgpmAXGARgewB5gDRi4gZgCYAOAFlyiQEYAGXAdyQNwAskiySBfbcaeElSYceZgHYC4ykgCcLME0QBWNjTLje/WAmTosufADZx1GYjqzGNI2otGjWyDqH7R+cculgqFkgqVTO00+Z0E9EUMJeXNqcmtEMgV2RBDtcOEDMUIiWSJzImV6RSQHMzAUgicBXUz3GwofDiMrEtTlfIrS6pcIrPxc2UbfInFbNsLgnoy3KMRckhICklalcsraNLDa2eyyWiNOkZi2/anQmtdI7LzW4+9A4pTZaZ3rgY7vXwJaVTaCZJILaXPr1eYA4bMAirCTndJvfpIMijcrfEidJRnLoWaivK6IiyeP7fWTlTFkdZIvGgubUUjjEnjQLjZ7Uuq05Q/czQpZtIxPIFs3b4agMpFFBLUajeFKOC69dl7OlHJHiXmYgU4oXvZh5Yq+DqNcl2Onagl0Wj6pCch5I3kpYEK4VA6jE63KJnWzWOmY6+ayAPmLyewieOxkM1gghcK0qMYJH6UxKRuZEAhiuO2+bKe3dAC6QA"));
			
			boxes.push({
				x: 240,
				y: 269-50,
				w: 100,
				h: 50,
				type: "hat"
			});
			boxes.push({
				x : 560,
				y : 269 - ukkeli.height * 2,
				w : ukkeli.width * 2,
				h : ukkeli.height * 2,
				type : "enemy slider",
				oX : 560,
				oY : 269 - ukkeli.height * 2,
				d1 : 20,
				d2 : 150,
				vX : 2,
				vY : 0,
				or : "h",
				img : ukkeli
			});
			boxes.push({
				x: 500,
				y: 200,
				w: 50,
				h: 50,
				type: "enemy slider",
				oX:  500,
				oY: 500,
				d1: 100,
				d2: 100,
				vX: 10,
				vY: 0,
				or: "h",
				img: kummitus
			});
			boxes.push({
				x : 1140,
				y : 511,
				w : 100,
				h : 10,
				type : "slider",
				oX : 1140,
				oY : 511,
				d1 : 10,
				d2 : 200,
				vX : 0,
				vY : 3,
				or : "v"
			});
			boxes.push({
				x : 1800,
				y : 391 - ukkeli.height * 2,
				w : ukkeli.width * 2,
				h : ukkeli.height * 2,
				type : "enemy slider",
				oX : 1800,
				oY : 391 - ukkeli.height * 2,
				d1 : 340,
				d2 : 40,
				vX : 10,
				vY : 0,
				or : "h",
				img : ukkeli
			});
			boxes.push({
				x: 3350,
				y: 200,
				w: 48,
				h: 48,
				type: "goal"
			});
			boxes.push({
				x: 3255,
				y: 576 - ukkeli.height * 2,
				w: ukkeli.width * 2,
				h: ukkeli.height * 2,
				type: "enemy",
				img: ukkeli
			});
			boxes.push({
				x: 3610,
				y: 576 - ukkeli.height * 2,
				w: ukkeli.width * 2,
				h: ukkeli.height * 2,
				type: "enemy",
				img: ukkeli
			});
			boxes.push({
				x: 3620,
				y: 250 - ukkeli.height * 2,
				w: ukkeli.width * 2,
				h: ukkeli.height * 2,
				type: "enemy",
				img: ukkeli
			});
			
			$("#container").css("background", "url("+cavebg.src+")");
		}
	}

	function controls() {
		if(!controlsEnabled){
			return;
		}
		if (keyA) {
			player.vX -= player.moveSpeed;
		} else if (keyD) {
			player.vX += player.moveSpeed;
		}
		if (keyW && player.flying) {
			player.y -= 10;
		} else if (keyS && player.flying) {
			player.y += 10;
		}
	}

	$("#kario").on("animationend webkitAnimationEnd oAnimationEnd", function titleAni(e) {
		if (e.originalEvent.animationName === "jump") {
			$(this).removeClass("animated");
		}
	});

	$(document).on("touchstart", function touchStartListener(e) {
		if (e.target.id === "leftarrow") {
			e.preventDefault();
			keyA = true;
		} else if (e.target.id === "rightarrow") {
			e.preventDefault();
			keyD = true;
		}
		if (e.target.id === "uparrow") {
			e.preventDefault();
			keyW = true;
		}
	});

	$(document).on("touchend", function touchEndListener(e) {
		if (e.target.id === "leftarrow") {
			e.preventDefault();
			keyA = false;
		} else if (e.target.id === "rightarrow") {
			e.preventDefault();
			keyD = false;
		}
		if (e.target.id === "uparrow") {
			e.preventDefault();
			keyW = false;
		}
	});

	$("#start").hover(function () {
		$("#kario").addClass("animated");
	});

	if (Cookies.get('musicmuted') === "true") {
		$("#music").prop("muted", true);
	}

	if (Cookies.get('graphics') === "false") {
		graphics = false;
	}
	
	if(Cookies.get('mobile') === "true"){
		$("#mobilecontrols").show();
	}

	$(document).on("keydown", function keyDownListener(e) {
		switch (e.which) {
		case 87:
			keyW = true;
			break;
		case 65:
			keyA = true;
			break;
		case 83:
			keyS = true;
			break;
		case 68:
			keyD = true;
			break;
		case 32:
			keySpace = true;
			break;
		case 27:
			if (gameOn) {
				keyEsc = keyEsc ? false : true;
				$("#pause").toggle();
			}
			break;
		case 17:
			player.flying = player.flying ? false : true;
			player.invincible = player.invincible ? false : true;
			player.noclip = player.noclip ? false : true;
			player.moveSpeed = player.moveSpeed === 5 ? 10 : 5;
			break;
		case 82:
			if(gameOn && !$("#nameinput").is(":focus")){
				levelScore = 0;
				$("#score").html("SCORE: "+(score+levelScore));
				initLevel(currentLevel);
				$("#level").css("opacity", 0);
				$("#level").hide();
				keyEsc = false;
				$("#pause").hide();
			}
			break;
		default:
			break;
		}
	});

	$(document).on("keyup", function keyUpListener(e) {
		switch (e.which) {
		case 87:
			keyW = false;
			break;
		case 65:
			keyA = false;
			break;
		case 83:
			keyS = false;
			break;
		case 68:
			keyD = false;
			break;
		case 32:
			keySpace = false;
			break;
		default:
			break;
		}
	});

	function karioRun() {
		player.sprite.ticks = 12 - Math.abs(player.vX);
		player.sprite.tick += 1;

		if (player.sprite.tick > player.sprite.ticks) {
			player.sprite.tick = 0;
			if (player.sprite.index < player.sprite.frames - 1) {
				player.sprite.index += 1;
			} else {
				player.sprite.index = 1;
			}
		}
	}

	function scroll() {
		scrollSpeed = Math.abs(player.vX);
		if (player.x > right) {
			player.x = right;
			bgX -= scrollSpeed;

			$("#container").css('background-position', bgX + 'px ' + bgY + 'px');

			for (b = 0; b < boxes.length; b += 1) {
				if (boxes[b].type !== "floor") {
					boxes[b].x -= scrollSpeed;
					boxes[b].oX -= scrollSpeed;
				}
			}
		} else if (player.x < left) {
			player.x = left;
			bgX += scrollSpeed;

			$("#container").css('background-position', bgX + 'px ' + bgY + 'px');

			for (f = 0; f < boxes.length; f += 1) {
				if (boxes[f].type !== "floor") {
					boxes[f].x += scrollSpeed;
					boxes[f].oX += scrollSpeed;
				}
			}
		}
	}

	function timeCounter(){
		$("#time").html(time);
		setTimeout(function(){
			if(time <= 0 && gameOn){
				die();
			}else if(!gameOn || !timeOn){
				return;
			}else{
				time--;
				timeCounter();
			}
		},1000);
	}
	
	function slide(slider) {
		if (slider.or === "h") {
			if (slider.x > slider.oX + slider.d1 || slider.x < slider.oX - slider.d2) {
				slider.vX *= -1;
			}
			slider.x += slider.vX;
		} else if (slider.or === "v") {
			if (slider.y > slider.oY + slider.d1 || slider.y < slider.oY - slider.d2) {
				slider.vY *= -1;
			}
			slider.y += slider.vY;
		}
	}

	function fall(faller) {
		faller.vY += gravity;
		faller.y += faller.vY;
	}

	function collision(shapeA, shapeB) {
		var vX = (shapeA.x + (shapeA.w / 2)) - (shapeB.x + (shapeB.w / 2)),
			vY = (shapeA.y + (shapeA.h / 2)) - (shapeB.y + (shapeB.h / 2)),
			hws = (shapeA.w / 2) + (shapeB.w / 2),
			hhs = (shapeA.h / 2) + (shapeB.h / 2),
			colDir = null,
			oX,
			oY;

		if (Math.abs(vX) < hws && Math.abs(vY) < hhs) {
			oX = hws - Math.abs(vX);
			oY = hhs - Math.abs(vY);

			if (oX >= oY) {
				if (vY > 0) {
					colDir = "t";
					shapeA.y += oY;
				} else {
					colDir = "b";
					shapeA.y -= oY;
				}
			} else {
				if (vX > 0) {
					colDir = "l";
					shapeA.x += oX;
				} else {
					colDir = "r";
					shapeA.x -= oX;
				}
			}
		}
		return colDir;
	}

	function win() {
		addScore(time);
		score += levelScore;
		currentLevel += 1;
		initLevel(currentLevel);
		player.noclip = false;
		player.flying = false;
		controlsEnabled = true;
		$("#level").css("opacity", 0);
		$("#level").hide();
	}

	function hit() {
		player.sprite.img = kariosheet;
		player.invincible = false;
	}

	function die() {
		levelScore = 0;
		initPlayer();
		player.flying = true;
		$("#level").animate({
			opacity: 100
		}, 1000);
		$("#level").show();
		$("#level span").html("GAME OVER<br>SCORE: "+ score +"<form><input type='text' placeholder='Type your name here' id='nameinput' maxlength='10' required><br><button id='submitscore'>Submit score</button></form><br><button id='retry'>Restart level</button><br><button id='mainmenu'>Exit to main menu</button>");
	}

	function moveEverything(amount) {
		for (d = 0; d < boxes.length; d += 1) {
			if (boxes[i].type !== "floor") {
				boxes[d].x += amount;
				boxes[d].oX += amount;
			}
		}
		player.x += amount;
		bgX += amount;
	}

	function teleport(x, y) {
		moveEverything(x);
		player.y = y;
	}

	function draw() {
		ctx.clearRect(0, 0, w, h);

		if (player.vX < 0) {
			ctx.save();
			ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
			ctx.scale(-1, 1);

			ctx.drawImage(player.sprite.img, player.sprite.index * player.w * 3, 0, player.w * 3, player.h * 3, -player.w / 2, -player.h / 2, player.w, player.h);
			ctx.restore();
		} else {
			ctx.drawImage(player.sprite.img, player.sprite.index * player.w * 3, 0, player.w * 3, player.h * 3, player.x, player.y, player.w, player.h);
		}

		for (i = 0; i < boxes.length; i += 1) {

			if (boxes[i].x >= -boxes[i].w && boxes[i].x <= w) {
				
				var type = boxes[i].type;

				if (type.match(/enemy/)) {
					ctx.drawImage(boxes[i].img, boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h);
				}

				if (type === "box") {

					if (graphics) {
						if(drawn.indexOf(i) > -1){
							$("#obj"+i).css({left: boxes[i].x+"px", top: boxes[i].y+"px"});
						}else{
							drawn.push(i);
							$("#container").append("<div class='object box NODELETE' id='obj"+i+"' style='width:" + boxes[i].w + "px;height:" + boxes[i].h + "px;left:" + boxes[i].x + "px;top:" + boxes[i].y + "px;'></div>");
						}
					} else {
						ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h);
					}

				} else if (type === "goal") {

					if (graphics) {
						if(drawn.indexOf(i) > -1){
							$("#obj"+i).css({left: boxes[i].x+"px", top: boxes[i].y+"px"});
						}else{
							drawn.push(i);
							$("#container").append("<div class='object goal NODELETE' id='obj"+i+"' style='width:" + boxes[i].w + "px;height:" + boxes[i].h + "px;left:" + boxes[i].x + "px;top:" + boxes[i].y + "px;'></div>");
						}
					} else {
						ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h);
					}

				} else if (type.match(/slider/)) {

					if (type === "slider") {
						ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h);
					}
				} else if (type === "hat") {
					ctx.drawImage(hat, boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h);
				} else if (type === "faller") {

					if (graphics) {
						if(drawn.indexOf(i) > -1){
							$("#obj"+i).css({left: boxes[i].x+"px", top: boxes[i].y+"px"});
						}else{
							drawn.push(i);
							$("#container").append("<div class='object faller NODELETE' id='obj"+i+"' style='width:" + boxes[i].w + "px;height:" + boxes[i].h + "px;left:" + boxes[i].x + "px;top:" + boxes[i].y + "px;'></div>");
						}
					} else {
						ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h);
					}

				}else if (type === "teleport") {
					ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h);
					ctx.drawImage(portal,boxes[i].x,boxes[i].y-(~~portal.height/2)+boxes[i].h,boxes[i].w,~~portal.height/2);
				}else if (type === "coin") {
					ctx.drawImage(kolikko,boxes[i].x,boxes[i].y-(~~kolikko.height/2)+boxes[i].h,boxes[i].w,~~kolikko.height/2);
				}
			}else{
				if(drawn.indexOf(i) > -1){
					drawn.splice(drawn.indexOf(i),1);
					$("#obj"+i).remove();
				}
			}
		}
	}

	function addScore(a){
		levelScore += a;
		$("#score").html("SCORE: "+(score+levelScore));
	}
	
	function removeObj(i){
		boxes.splice(i,1);
		$(".object").remove();
		drawn = [];
	}
	
	ctx.fillStyle = "white";
	function update() {

		if (((player.vX > 0.1 || player.vX < -0.1) && waitFriction <= 0) || (keyA || keyD)) {
			karioRun();
		} else {
			player.sprite.index = 0;
		}

		if ((!player.onGround && !player.flying) || (waitFriction > 0 && !player.flying)) {
			player.vY += gravity;
			player.y += ~~player.vY;
			waitFriction -= 1;
		}

		player.x += player.vX;
		player.vX *= friction;

		friction = 0.2;
		player.onGround = false;

		for (i = 0; i < boxes.length; i += 1) {

			var type = boxes[i].type;
		
			if ((boxes[i].x >= -boxes[i].w && boxes[i].x <= w) || type.match(/slider/)) {

				if (boxes[i].y > 1000) {
					removeObj(i);
					break;
				}

				if (type.match(/slider/)) {

					if (boxes[i].hasOwnProperty("triggered")) {
						if (boxes[i].triggered) {
							slide(boxes[i]);
						}
					} else {
						slide(boxes[i]);
					}

				} else if (type === "faller") {
					if (boxes[i].triggered) {
						fall(boxes[i]);
					}
				}

				if (!player.noclip) {
					dir = collision(player, boxes[i]);

					if (dir === "l") {
						player.vX = 0;
					} else if (dir === "r") {
						player.vX = 0;
					} else if (dir === "b") {
						player.onGround = true;
						player.vY = 0;
					} else if (dir === "t" && player.vY < 0) {
						player.vY = 0;
					}

					if (!!dir) {
						if (type === "goal") {
							$("#level").animate({
								opacity: 100
							});
							$("#level").show();
							$("#level span").html("LEVEL CLEARED");
							controlsEnabled = false;
							player.noclip = true;
							player.flying = true;
							timeOn = false;
							setTimeout(win, 2000);
						} else if (type.match(/enemy/)) {
							if (dir === "b") {
								removeObj(i);
								addScore(100);
							} else {
								if (!player.invincible) {
									if (player.hat) {
										if (dir === "l") {
											player.vX += 50;
										} else if (dir === "r") {
											player.vX -= 50;
										} else if (dir === "t") {
											player.vY += 50;
										}
										player.invincible = true;
										player.hat = false;
										player.sprite.img = kariohit;
										setTimeout(hit, 3000);
									} else {
										die();
									}
								}
							}
						} else if (type.match(/slider/) && dir === "b") {
							friction = 1;
							waitFriction = 2;
							player.vX = boxes[i].vX;
							if (boxes[i].hasOwnProperty("triggered")) {
								boxes[i].triggered = true;
							}
						} else if (type === "hat") {
							player.sprite.img = kariohat;
							player.hat = true;
							removeObj(i);
							break;
						} else if (type === "faller" && dir === "b") {
							boxes[i].triggered = true;
						} else if (type === "teleport" && dir === "b") {
							teleport(boxes[i].tX - boxes[i].x, boxes[i].tY);
						} else if (type === "coin") {
							removeObj(i);
							addScore(100);
						}
					}
				}
			}
		}

		if ((keyW || keySpace) && player.onGround) {
			player.vY = vTerminal;
			player.onGround = false;
		}

		if (!(keyW || keySpace) && player.vY < vTerminal / 2) {
			player.vY = vTerminal / 2;
		}

		if (player.y > 1000) {
			die();
		}
	}

	function getCursorPosition(event) {
		var rect = c.getBoundingClientRect(),
			x = event.clientX - rect.left,
			y = event.clientY - rect.top;

		return {
			x : x,
			y : y
		};
	}

	function resetEverything() {
		keyEsc = true;
		$("*:not(NODELETE)").show();
		$("#level").css("opacity", 0);
		$("#level").hide();
		$("#pause").hide();
		$("#mobilecontrols").hide();
		$(".object").remove();
	}

	function animate() {
		if (!gameOn) {
			return;
		}
		if (!lastRun) {
			lastRun = new Date().getTime();
			reqAnimFrame(animate);
			return;
		}
		var delta = (new Date().getTime() - lastRun) / 1000;
		lastRun = new Date().getTime();
		fps = 1 / delta;
		if (fpscounter >= 20) {
			$("#fps").html(parseFloat(fps).toFixed(0));
			fpscounter = 0;
		}
		fpscounter += 1;
		reqAnimFrame(animate);
		if (keyEsc) {
			return;
		}

		controls();
		scroll();
		update();
		//logic ^
		
		draw();
	}

	function logic() {
		/*
		if (!gameOn) {
			return;
		}
		setTimeout(logic, 1000 / 60);
		if (keyEsc) {
			return;
		}
		controls();
		scroll();
		update();
		*/
	}

	$(document).on("click tap", function clickListener(e) {
		if (e.target.id === "resume") {

			keyEsc = false;
			$("#pause").hide();

		} else if (e.target.id === "exit" || e.target.id === "mainmenu") {

			levelScore = 0;
			$("#score").html("SCORE: "+(score+levelScore));
			resetEverything();
			$("#music").attr("src", "snd/entrance_final.mp3");
			$("#music").load();
			$(".level").removeClass("selectedlevel");
			$("#level" + currentLevel).addClass("selectedlevel");
			$("#time").html("");
			gameOn = false;

		} else if (e.target.id === "retry") {

			score = 0;
			levelScore = 0;
			$("#score").html("SCORE: "+(score+levelScore));
			$("#level").css("opacity", 0);
			$("#level").hide();
			initLevel(currentLevel);
			keyEsc = false;
			$("#pause").hide();

		} else if ($(e.target).is(".level")) {

			$(".level").removeClass("selectedlevel");
			$(e.target).addClass("selectedlevel");
			currentLevel = parseInt($(e.target).html(), 10);

		} else if (e.target.id === "canvas" && player.hat && !keyEsc) {

			var coords = getCursorPosition(e);
			boxes.push({
				x : coords.x,
				y : coords.y,
				w : 50,
				h : 10,
				type : "box"
			});
			player.hat = false;
			player.sprite.img = kariosheet;

		} else if (e.target.id === "start") {
			
			levelScore = 0;
			keyEsc = false;
			gameOn = true;
			initLevel(currentLevel);
			animate();
			logic();
			$("#container *:not(.NODELETE)").hide();
		} else if (e.target.id === "custom" && $("#custominput").val()) {
	
			levelScore = 0;
			keyEsc = false;
			gameOn = true;
			currentLevel = "custom";
			initLevel(currentLevel);
			animate();
			logic();
			$("#container *:not(.NODELETE)").hide();

		} else if (e.target.id === "togglemobile") {

			$("#mobilecontrols").toggle();
			
			Cookies.set('mobile', $("#mobilecontrols").is(":visible"), {
				expires : 3650,
				path : ''
			});

		} else if (e.target.id === "togglemusic" || e.target.id === "togglemusicpause") {

			toggle = $("#music").prop("muted");
			toggle = !toggle;
			$("#music").prop("muted", toggle);
			
			Cookies.set('musicmuted', toggle, {
				expires : 3650,
				path : ''
			});

		} else if (e.target.id === "togglegraphics" || e.target.id === "togglegraphicspause") {

			$(".object").remove();
			graphics = graphics ? false : true;

			Cookies.set('graphics', graphics, {
				expires : 3650,
				path : ''
			});

		} else if(e.target.id === "submitscore"){
			e.preventDefault();
			$.ajax({
				url: "php/submitscore.php",
				method: "POST",
				data: {
					name: $("#nameinput").val(),
					score: score
				},
				success: function(msg){
					resetEverything();
					$("#music").attr("src", "snd/entrance_final.mp3");
					$("#music").load();
					$(".level").removeClass("selectedlevel");
					$("#level" + currentLevel).addClass("selectedlevel");
					addScore(-score);
					gameOn = false;
				}
			});
		}
	});
}(this));