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
		tile.appendChild(createImage(i));
		tile.appendChild(createBack(i));
		img.setAttribute("class", "face-down");
		return tile;
	};

	var memory = {
		build: function(element){
			       for (var i=0; i != 9; ++i) {
				       var img = createImage(i);
				       element.append(img);
			       }
		},
		start: function(){ 
			state.started();
		}
	};
	return memory;
}();
