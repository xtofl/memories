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
					turn: function(){ 
						newTile.facedUp = !newTile.facedUp; 
						newTile.turn.calls.push({});
					},
					faceDown: function() { newTile.facedUp = false; },
					addEventListener: addEventListener
				};
				newTile.turn.calls = [];
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
			shuffle: this.shuffle
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
		var tile = this.tiles[0];
		expect(tile.turn.calls.length).toBe(0);
		this.game.turn(tile);
		expect(tile.turn.calls.length).toBe(1);
		this.game.turn(tile);
		expect(tile.turn.calls.length).toBe(1);
	});
});
