extends Control
class_name ShellBaseMenu

signal change_to(next_scene, params);
signal pop_scene();


func init(_params : Dictionary):
	pass;


func change_to_shell(next_scene : String, params : Dictionary) -> void:
	emit_signal("change_to", next_scene, params);


func back_out() -> void:
	emit_signal("pop_scene");
