//require jquery
var memory = function(settings){
	var current_up = null;
	var states = {
		begin: { 
			started: function(){
				console.log("begin: started -> wait_turn_first");
				state = states.wait_turn_first;
			},
			canTurn: function() { return true; }
		},
		wait_turn_first: {
			turn: function(tile){
				console.log("wait_turn_first: turn -> wait_turn_second");
				state = states.wait_turn_second;
				current_up = tile;
			},
			canTurn: function() { return true; }
		},
		wait_turn_second: {
			turn: function(tile){
				console.log("wait_turn_second: turn -> ...");
				turn_second_tile(tile);
			},
			canTurn: function() { return true; }
		},
		wait_turned_back: {
			turned_back: function(){
				console.log("wait_turned_back: turned_back -> wait_turn_first");
				state = states.wait_turn_first;
			},
			canTurn: function() { return false; }
		},
		won: ""
	};

	var turn_second_tile = function(tile){
		if (tile.matches(current_up)) {
			console.log("match ...");
			current_up.done();
			tile.done();
			if (allDone()){
				console.log("... won");
				finishGame();
				state = states.won;
			} else {
				console.log("... wait_turn_first");
				state = states.wait_turn_first;
			}
		} else {
			console.log("no match");
			scheduleTurnBack([current_up, tile]);
			state = states.wait_turned_back;
		}
	};
	var scheduleTurnBack = function(tiles){
		console.log("scheduling turn back tiles");
		setTimeout(function(){
		        console.log("turning back tiles");
			for (var i=0; i != tiles.length; ++i){
				tiles[i].turn();
			};
			state.turned_back();
		}, 2000);
	};
	var finishGame = function(){
		settings.whenFinished();
	};
	var allTiles = [];
	var allDone = function(){
		for (var i=0; i != allTiles.length; ++i){
			if (allTiles[i].notDone()) {
				return false;
			}
		}
		return true;
	};
	var state = states.begin;

	var createImage = function(i){
		var img = document.createElement("img");
		// note: images coming from http://eofdreams.com/butterfly.html
		var src = i; 
		img.setAttribute("src", src);
		img.setAttribute("class", "front");
		img.matches = function(other){
			var other_src = other.getAttribute("src");
			return src == other_src;
		};
		return img;
	};

	var createBack = function(i){
		var img = document.createElement("img");
		img.setAttribute("src", "images/back.jpg");
		img.setAttribute("class", "back");
		return img;
	};

	var createTile;
	if (settings.createTile) {
		createTile = settings.createTile;
	} else {
		createTile = function(i){
			var tile = document.createElement("div");
			var done = false;
			var img = createImage(i);
			tile.appendChild(img);
			tile.img = img;
			var back = createBack(i);
			tile.appendChild(back);
			tile.setAttribute("class", "face-down");
			tile.matches = function(other){
				return tile.img.matches(other.img);
			};
			tile.turnUp = function(){
				tile.setAttribute("class", "face-up");
				if (!state.turn){
					console.log("BBAAAH");
				}
				state.turn(tile);
				tile.turn = tile.faceDown;
			};
			tile.faceDown = function(){
				tile.setAttribute("class", "face-down");
				tile.turn = tile.turnUp;
			};
			tile.done = function(){
				tile.removeEventListener("click", turnTile);
				tile.turn = function(){};
				tile.setAttribute("class", tile.getAttribute("class")+" done");
				done = true;
			};
			tile.notDone = function(){return !done;}
			tile.turn = tile.turnUp;

			var turnTile = function(){
				if (state.canTurn()){
					tile.turn();
				}
			};
			tile.addEventListener("click", turnTile);
			return tile;
		};
	}

	var shuffled = function(elements) {
		return elements.slice().sort(function(){return 0.5 - Math.random();});
	};

	var onGameFinish = function(){
	};

	var memory = {
		createTile: createTile,
		deal: function(element){
				var tiles = [];
				for (var i=0; i != settings.images.length; ++i) {
					tiles.push(memory.createTile(settings.images[i]));
					tiles.push(memory.createTile(settings.images[i]));
				}
				tiles = shuffled(tiles);
				for (var i=0; i != tiles.length; ++i){
					element.appendChild(tiles[i]);
					tiles[i].faceDown();
				}
				allTiles = tiles;
				memory.tiles = tiles;
		},
		start: function(){ 
			state.started();
		},
	};
	return memory;
};
