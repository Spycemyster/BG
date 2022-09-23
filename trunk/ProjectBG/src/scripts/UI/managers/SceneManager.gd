extends Node

var current_scene = null;
@export var transition_player : AnimationPlayer;
var scene_path : String;
const BASE_TRANSITION_TIME := 1.5;
const FADE_SPEED := 1.0;
var is_transitioning := false;

func _ready() -> void:
	var root = get_tree().root;
	current_scene = root.get_child(root.get_child_count() - 1);


func goto_scene(path : String) -> void:
	scene_path = path;
	if transition_player.is_playing():
		transition_player.stop();
	_fade();


func load_scene() -> void:
	if get_tree().change_scene_to_file(scene_path) != OK:
		printerr("Could not load scene " + scene_path);
	pass


func _fade() -> void:
	transition_player.stop(true);
	transition_player.play("fade", -1, FADE_SPEED);
	pass

