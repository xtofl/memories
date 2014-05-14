var addCallCount = function(argumentProto, f){
	var newF = function(){
		var i = 0;
		var argumentObject = {};
		for(var key in argumentProto){
			argumentObject[key] = arguments[i++];
		}	
		newF.calls.push(argumentObject);
		return f.apply(this, arguments);
	};
	newF.calls = [];
	return newF;
};

describe("AddCallCount decorator", function(){
	
	it("records a call", function(){
		var c = addCallCount({}, function(){});
		c();
		expect(c.calls.length).toBe(1);
	});
	
	it("records arguments provided to a call", function(){
		var c = addCallCount({x: 1, y: 2}, function(){});
		c(10, 20);
		expect(c.calls.length).toBe(1);
		expect(c.calls[0].x).toBe(10);
		expect(c.calls[0].y).toBe(20);
	});
});

describe("The Memory game state machine", function(){
	beforeEach(function() {
		var stateMachine;
		this.element = {
			appendChild: addCallCount({child: null}, 
				function(child){})
		};
		var tiles = [];
		this.tiles = tiles;
		var tileFactory = {
			createTile: function(image){
				tileFactory.createTile.calls.push({image: image});
				var addEventListener = function(name, handler){
					addEventListener.calls.push({name: name, handler: handler});
				};
				addEventListener.calls = [];
				var newTile = {
					image: image,
					facedUp: true,
					faceUp: addCallCount({}, function(){ 
						newTile.facedUp = true;
					}),
					faceDown: addCallCount({}, function(){ 
						newTile.facedUp = false;
					}),
					matches: addCallCount({tile: null}, function(tile){
						return newTile.matchTile === tile;
					}),
					addEventListener: addEventListener
				};
				tiles.push(newTile);
				return newTile;
			}
		};
		tileFactory.createTile.calls = [];
		this.tileFactory = tileFactory;
		var shuffle = function(arr) {
			shuffle.calls.push({arr: arr});
			return arr;
		};
		this.shuffle = shuffle;
		this.shuffle.calls = [];
		this.settings = {
			images:["x","y","z"], 
			createTile: this.tileFactory.createTile, 
			shuffle: this.shuffle,
			setTimeout: addCallCount({f: null, time: null}, function(f,time){
			})
		};
		this.game = memory(this.settings);
	});
	it("should create two tiles for each image", function(){
		this.game.deal(this.element);
		expect(this.tileFactory.createTile.calls.length).toBe(6);
		var its = this;
		this.settings.images.forEach(function(image){
			var forImage = function(call){ return call.image === image; };
			expect(its.tileFactory.createTile.calls.filter(forImage).length).toBe(2);
		});
	});
	it("should deal two tiles per image", function(){
		this.game.deal(this.element);
		expect(this.game.tiles.length).toBe(6);
	});
	it("should add shuffled tiles to element", function(){
		this.element.appendChild.calls = [];
		this.game.deal(this.element);
		expect(this.element.appendChild.calls.length).toBe(this.tiles.length);
	});
	it("should shuffle tiles when dealing", function(){
		this.shuffle.calls = []
		this.game.deal(this.element);
		expect(this.shuffle.calls.length).toBe(1);
	});
	it("should start with all tiles face down", function(){
		this.game.deal(this.element);
		var facedUp = function(tile){
			return tile.facedUp;
		};
		expect(this.tiles.filter(facedUp).length).toBe(0);
	});
	it("should install click handler on every tile", function(){
		this.game.deal(this.element);
		var shouldHaveEventlistener = function(tile){
			var calls = tile.addEventListener.calls;
			expect(calls.length).toBe(1);
			expect(calls[0].name).toEqual("click");
			expect(calls[0].handler).toBeDefined();
		};
		this.tiles.forEach(shouldHaveEventlistener);
	});
	it("should not listen to two turns on same tile", function(){
		this.game.deal(this.element);
		this.game.start();
		var tile = this.tiles[0];
		expect(tile.faceUp.calls.length).toBe(0);
		this.game.turn(tile);
		expect(tile.faceUp.calls.length).toBe(1);
		this.game.turn(tile);
		expect(tile.faceUp.calls.length).toBe(1);
	});
	it("should turns up the second tile", function(){
		this.game.deal(this.element);
		this.game.start();
		expect(this.tiles[0].faceUp.calls.length).toBe(0);
		this.game.turn(this.tiles[0]);
		expect(this.tiles[0].faceUp.calls.length).toBe(1);
		this.game.turn(this.tiles[1]);
		expect(this.tiles[1].faceUp.calls.length).toBe(1);
	});
	it("should schedule an action after turning up the second tile", function(){
		this.game.deal(this.element);
		this.game.start();
		this.game.turn(this.tiles[0]);
		this.game.turn(this.tiles[1]);
		expect(this.settings.setTimeout.calls.length).toBe(1);
	});
	it("should have a scheduled action that faces down tiles after turning up the second tile", function(){
		this.game.deal(this.element);
		this.game.start();
		this.game.turn(this.tiles[0]);
		this.game.turn(this.tiles[1]);

		this.tiles[0].faceDown.calls = [];
		this.tiles[1].faceDown.calls = [];

		this.settings.setTimeout.calls[0].f();

		expect(this.tiles[0].faceDown.calls.length).toBe(1);
		expect(this.tiles[1].faceDown.calls.length).toBe(1);
	});
});
