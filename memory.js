//require jquery
var memory = function(){
	var states = {
		begin: { 
			started: function(){
				state = states.wait_clicked;
			} },
		wait_clicked: {
			clicked: function(){
				state = states.wait_clicked_again;
			}
		},
		wait_clicked_again: {
			clicked: function(){
				state = states.wait_clicked;
			}
		},
		won: ""
	};
	var state = states.wait_clicked;

	var createImage = function(i){
		var img = document.createElement("img");
		img.setAttribute("src", "images/butterfly-0"+(i+1)+".jpg");
		img.setAttribute("class", "front");
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
		var back = createBack(i);
		tile.appendChild(back);
		tile.setAttribute("class", "face-down");
		$(tile).click(function(){
			tile.setAttribute("class", "face-up");
		});
		return tile;
	};

	var memory = {
		build: function(element){
			       for (var i=0; i != 9; ++i) {
				       var tile = createTile(i);
				       element.append(tile);
			       }
		},
		start: function(){ 
			state.started();
		}
	};
	return memory;
}();
