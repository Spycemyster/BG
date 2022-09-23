extends HBoxContainer

class_name ExpeditionEntry


# Signals
signal start_expedition(index);
signal collect_reward(index);


# Loaded Nodes
@export var icon : TextureRect;
@export var start : Button;
@export var collect : Button;
@export var completed_label : RichTextLabel;
@export var description : RichTextLabel;
@export var title : RichTextLabel;
@export var timestamp : RichTextLabel;

# Variables
var index : int;
var start_time : int;
var completion_time : int;
var completed : bool;
var state;

func _ready() -> void:
	collect.connect("pressed",Callable(self,"_collect_reward"));
	start.connect("pressed",Callable(self,"_start_expedition"));


func _collect_reward() -> void:
	emit_signal("collect_reward", index);


func _start_expedition() -> void:
	emit_signal("start_expedition", index);

