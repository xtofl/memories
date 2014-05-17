//require jquery
var memory = function(settings){
	var current_up = null;
	var states = {
		begin: { 
			started: function(){
				console.log("begin: started -> wait_turn_first");
				state = states.wait_turn_first;
			},
			canTurn: function(tile) { return true; }
		},
		wait_turn_first: {
			turn: function(tile){
				console.log("wait_turn_first: turn -> wait_turn_second");
				state = states.wait_turn_second;
				current_up = tile;
				tile.faceUp();
			},
			canTurn: function(tile) { return true; }
		},
		wait_turn_second: {
			turn: function(tile){
				console.log("wait_turn_second: turn -> ...");
				turn_second_tile(tile);
			},
			canTurn: function(tile) { 
				return tile !== current_up; 
			}
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
		if (tile === current_up) return;
		tile.faceUp();
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
	var schedule = settings.setTimeout || setTimeout;
	var scheduleTurnBack = function(tiles){
		console.log("scheduling turn back tiles");
		schedule(function(){
		        console.log("turning back tiles");
			for (var i=0; i != tiles.length; ++i){
				tiles[i].faceDown();
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
			tile.setAttribute("class", "tile face-down");
			tile.matches = function(other){
				return tile.img.matches(other.img);
			};
			tile.faceUp = function(){
				tile.setAttribute("class", "tile face-up");
			};
			tile.faceDown = function(){
				tile.setAttribute("class", "face-down");
			};
			tile.done = function(){
				tile.setAttribute("class", tile.getAttribute("class")+" done");
				done = true;
			};
			tile.notDone = function(){return !done;}
			return tile;
		};
	}

	var shuffled;
	if (settings.shuffle) {
		shuffled = settings.shuffle;
	} else {
		shuffled = function(elements) {
			return elements.slice().sort(function(){return 0.5 - Math.random();});
		};
	};

	var onGameFinish = function(){
	};

	var statistics = {
		turns: 0,
		alreadyTurned: [],
		sameTile: 0
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
				tiles.forEach(function(tile){
					element.appendChild(tile);
					tile.faceDown();

					var turnTile = function(){
						memory.turn(tile);
					};
					tile.addEventListener("click", turnTile);
				});
				allTiles = tiles;
				memory.tiles = tiles;
		},
		turn: function(tile) {
		      if (state.canTurn(tile)){
				++statistics.turns;
				if (statistics.alreadyTurned.indexOf(tile) > -1) {
					++statistics.sameTile;
				}
				statistics.alreadyTurned.push(tile);
				settings.stats(statistics);
				state.turn(tile);
		      }
		},
		start: function(){ 
			state.started();
		},
		stats: function(){
			return statistics;
		}
	};
	return memory;
};
