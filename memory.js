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
	return {
		start: function(){ 
			state.started();
		}
	};
}();
