describe("The Memory game state machine", function(){
	beforeEach(function() {
		var stateMachine;
		this.element = {appendChild: function(){}};
		var tiles = [];
		this.tiles = tiles;
		var tileFactory = {
			createTile: function(image){
				tileFactory.createTile.calls.push({image: image});
				var newTile = {
					image: image,
					facedUp: true,
					turn: function(){ newTile.facedUp = !newTile.facedUp; },
					faceDown: function() { newTile.facedUp = false; }
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
	it("should not accept two clicks on same tile", function(){
		
	});
});
