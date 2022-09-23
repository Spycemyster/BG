extends Node3D

# node paths
@export var sprite_path : NodePath;
@export var name_path : NodePath;
@export var particles_path : NodePath;


# export var
@export var sprite_height : float = 800.0;


# loaded nodes
@onready var sprite : Sprite3D = get_node(sprite_path);
@onready var name_label : Label3D = get_node(name_path);
@onready var particles : CPUParticles3D = get_node(particles_path);


# variables
var time : float = 0;


func init(texture : String, name : String, _rarity : int, resource : Resource) -> void:
	await Downloader.get_file(texture, "user://" + texture);
	var icon = Downloader.create_texture("user://" + texture);
	name_label.text = name;
	sprite.texture = icon;
	sprite.pixel_size = sprite_height * 0.001 / sprite.texture.get_height();
	particles.amount = resource.amount * 8;
	particles.mesh = resource.mesh;
	particles.mesh.surface_get_material(0).albedo_color = resource.color;


func _process(delta: float) -> void:
	time += delta;
	sprite.transform.origin = Vector3(0, sin(time * 2) * 0.08, 0);



