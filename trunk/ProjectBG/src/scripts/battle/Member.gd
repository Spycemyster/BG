extends Sprite2D

class_name BattleMember

signal death(member);

# path nodes
@export var max_health_rect_path: NodePath;
@export var health_rect_path: NodePath;
@export var canvas_layer_path: NodePath;


# loaded nodes
@onready var max_health_rect : ColorRect = get_node(max_health_rect_path);
@onready var health_rect : ColorRect = get_node(health_rect_path);
@onready var canvas_layer : CanvasLayer = get_node(canvas_layer_path);


# constants
const TIMESTEP = 0.5;


# variables
var uid : String;
var max_health : int;
var health : int;

func damage(amount : int) -> void:
	print("took " + str(amount) + "damage, now at health "\
		+ str(health) + "/" + str(max_health));
	health -= amount;
	update_healthbars();
	if health <= 0:
		emit_signal("death", self);
	pass


func set_position(position : Vector2) -> void:
	self.position = position;
	canvas_layer.offset = self.position;


func update_healthbars() -> void:
	health_rect.size.x = max_health_rect.size.x * (float(health) / max_health);
	pass

func _ready() -> void:
	update_healthbars();
	pass
