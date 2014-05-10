describe("The Memory game state machine", function(){
	var stateMachine;
	var element = {appendChild: function(){}};
	var tiles = [];
	var tileFactory = {createTile: function(image){
		tileFactory.createTile.calls.push({image: image});
		var newTile = {
			image: image,
			facedUp: true,
			turn: function(){ newTile.facedUp = !newTile.facedUp; },
			faceDown: function() { newTile.facedUp = false; }
		};
		tiles.push(newTile);
		return newTile;
	}};
	tileFactory.createTile.calls = [];
	var shuffle = function(arr) {
		shuffle.calls.push({arr: arr});
		return arr;
	};
	shuffle.calls = [];
	var settings = {
		images:["x","y","z"], 
		createTile: tileFactory.createTile, 
		shuffle: shuffle
	};
	var game = memory(settings);
	it("should create two tiles for each image", function(){
		game.deal(element);
		expect(tileFactory.createTile.calls.length).toBe(6);
		settings.images.forEach(function(image){
			var forImage = function(call){ return call.image === image; };
			expect(tileFactory.createTile.calls.filter(forImage).length).toBe(2);
		});
	});
	it("should deal two tiles per image", function(){
		game.deal(element);
		expect(game.tiles.length).toBe(6);
	});
	it("should shuffle tiles when dealing", function(){
		shuffle.calls = []
		game.deal(element);
		expect(shuffle.calls.length).toBe(1);
	});
	it("should start with all tiles face down", function(){
		game.deal(element);
		var facedUp = function(tile){
			return tile.facedUp;
		};
		expect(tiles.filter(facedUp).length).toBe(0);
	});
});
