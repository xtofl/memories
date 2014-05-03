//require jquery
var memory = function(){
	var current_up = null;
	var states = {
		begin: { 
			started: function(){
				console.log("begin: started -> wait_turn_first");
				state = states.wait_turn_first;
			} },
		wait_turn_first: {
			turn: function(tile){
				console.log("wait_turn_first: turn -> wait_turn_second");
				state = states.wait_turn_second;
				current_up = tile;
			}
		},
		wait_turn_second: {
			turn: function(tile){
				console.log("wait_turn_second: turn -> ...");
				state = states.wait_turn_first;
				if (tile.matches(current_up)) {
					console.log("match");
					current_up.done();
					tile.done();
				} else {
					console.log("no match");
					scheduleTurnBack([current_up, tile]);
				}
			}
		},
		won: ""
	};
	var scheduleTurnBack = function(tiles){
		console.log("scheduling turn back tiles");
		setTimeout(function(){
		        console.log("turning back tiles");
			for (var i=0; i != tiles.length; ++i){
				tiles[i].turn();
			};
		}, 2000);
	};
	var state = states.begin;

	var createImage = function(i){
		var img = document.createElement("img");
		// note: images coming from http://eofdreams.com/butterfly.html
		var src = "images/butterfly-0"+(i+1)+".jpg";
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

	var createTile = function(i){
		var tile = document.createElement("div");
		var img = createImage(i);
		tile.appendChild(img);
		tile.img = img;
		var back = createBack(i);
		tile.appendChild(back);
		tile.setAttribute("class", "face-down");
		tile.matches = function(other){
			return tile.img.matches(other.img);
		};
		tile.up = function(){
			tile.setAttribute("class", "face-up");
			state.turn(tile);
			tile.turn = tile.down;
		};
		tile.down = function(){
			tile.setAttribute("class", "face-down");
			tile.turn = tile.up;
		};
		tile.done = function(){
			$(tile).unbind("click", turnTile);
			tile.turn = function(){};
		};
		tile.turn = tile.up;
		
		var turnTile = function(){
			tile.turn();
		};
		$(tile).bind("click", turnTile);
		return tile;
	};

	var shuffled = function(elements) {
		return elements;
	};

	var memory = {
		build: function(element){
				var tiles = [];
				for (var i=0; i != 5; ++i) {
					tiles.push(createTile(i));
					tiles.push(createTile(i));
				}
				tiles = shuffled(tiles);
				for (var i=0; i != tiles.length; ++i){
					element.append(tiles[i]);
				}
		},
		start: function(){ 
			state.started();
		}
	};
	return memory;
}();
