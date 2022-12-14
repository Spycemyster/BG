extends Node
signal swipe;
var swipe_start = null;
var minimum_drag = 100;

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("click"):
		swipe_start = get_viewport().get_mouse_position();
	if event.is_action_released("click"):
		_calculate_swipe(get_viewport().get_mouse_position());


func _calculate_swipe(swipe_end) -> void:
	if swipe_start == null:
		return;
	
	var swipe = swipe_end - swipe_start;
	if abs(swipe.x) > minimum_drag:
		if swipe.x > 0:
			emit_signal("swipe", "right");
		else:
			emit_signal("swipe", "left");
