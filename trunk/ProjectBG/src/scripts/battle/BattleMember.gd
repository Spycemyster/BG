extends Sprite3D


# node paths
@export var particle_generator_path: NodePath;


# loaded vars
@onready var particle_generator : CPUParticles3D = get_node(particle_generator_path);


# variables
var _data : Dictionary;


func init(member_data : Dictionary) -> void:
	_data = member_data;


func _ready() -> void:
	# load character pose
	pass
