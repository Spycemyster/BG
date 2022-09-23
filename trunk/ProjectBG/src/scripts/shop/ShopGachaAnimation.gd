extends Node

# node paths
@export var drop_list_path : NodePath;
@export var animation_path : NodePath;
@export var particle_player_path : NodePath;
@export var back_path : NodePath;
@export var animation_camera_path : NodePath;
@export var item_camera_path : NodePath;
@export var item_list_path : NodePath;

# rarity resource
@export var common : Resource;
@export var uncommon : Resource;
@export var rare : Resource;
@export var epic : Resource;
@export var legendary : Resource;


# loaded nodes
@onready var drop_list : Node = get_node(drop_list_path);
@onready var animation_player : AnimationPlayer = get_node(animation_path);
@onready var animation_camera : Camera3D = get_node(animation_camera_path);
@onready var particle_player : CPUParticles3D = get_node(particle_player_path);
@onready var back_button : Button = get_node(back_path);
@onready var item_camera : Camera3D = get_node(item_camera_path);
@onready var item_list : Node = get_node(item_list_path);


# variables
var particle_call_queue = [];
var gacha_item_display = load(BgConstants.SHOP_GACHA_DISPLAY_ITEM_PATH);
var delta_theta : float = 2 * PI;
var selection_index = 0;
var num_rolls = 1;
var gacha_items = [];
var rng = RandomNumberGenerator.new();
var camera_tween : Tween;

func _ready() -> void:
	set_process(false);
	back_button.connect("pressed",Callable(self,"_return_home"));
	animation_player.connect("animation_finished",Callable(self,"_finished_animation"));
	_load_and_play_animation();
	pass

func _load_and_play_animation() -> void:
	# clear item list
	for n in item_list.get_children():
		item_list.remove_child(n);
		n.queue_free();
	var rolls = GlobalData.data["roll_data"]["rolls"];
	animation_player.play("Roll");
	var radius = 3;
	num_rolls = len(rolls);
	delta_theta = 2.0 * PI / num_rolls;
	for i in range(num_rolls):
		var roll = _get_roll_data(rolls[i]);
		particle_call_queue.push_back(roll);
		
		# repopulate item list
		var item = gacha_item_display.instantiate();
		item_list.add_child(item);
		var resource = _rarity_to_resource(roll.rarity);
		item.init(roll.icon, roll.name, roll.rarity, resource);
		var theta = delta_theta * i;
		item.transform.origin = Vector3(radius * sin(theta), 0, -radius * cos(theta));
		item.rotation = Vector3(0, -theta, 0);
		gacha_items.push_back(item);
	
	_sort_by_rarity(particle_call_queue);
	pass

func _sort_by_rarity(list : Array) -> void:
	# counting sort O(n) magic
	var freq_table = {
		0 : [], 1 : [], 2 : [], 3 : [], 4 : [],
	}; # map rarity to array of items that have that rarity
	for i in range(len(list)):
		var item = list[i];
		freq_table[item.rarity].push_back(item);
	
	var index = 0;
	var rarity_index = 0;
	while rarity_index < freq_table.size():
		var arr = freq_table[rarity_index];
		for i in range(len(arr)):
			list[index] = arr[i];
			index += 1;
		rarity_index += 1;


func _get_roll_data(item : Dictionary) -> Dictionary:
	match item.type:
		"item":
			var data = GlobalData.item_list[item.item];
			var rarity = data.rarity;
			return { "rarity" : rarity, "icon" : data.icon, "type" : item.type,
				"name" : data.name };
		"member":
			var data = GlobalData.member_list[item.item];
			var rarity = data.rarity;
			return { "rarity" : rarity, "icon" : 
				BgConstants.get_portrait_for(data.assetFolder),
				"type" : item.type, "name" : data.fullName };
	return {};


func _rarity_to_resource(rarity : int) -> Resource:
	match rarity:
		0:
			return common;
		1:
			return uncommon;
		2:
			return rare;
		3:
			return epic;
		4:
			return legendary;
	return null;


func play_queued_particles() -> void:
	var index = 0;
	
	while index < len(particle_call_queue):
		var resource = _rarity_to_resource(particle_call_queue[index].rarity);
		particle_player.amount = resource.amount;
		particle_player.lifetime = resource.length;
		particle_player.mesh.surface_get_material(0).albedo_color = resource.color;
		particle_player.emitting = true;
		particle_player.restart();

		# TODO: Change this to a regular timer
		await get_tree().create_timer(resource.length + rng.randf_range(0.0, 0.5)).timeout;
		index += 1;
		pass
	pass
	particle_call_queue.clear();
	animation_player.play("Transition");


func _finished_animation(name) -> void:
	if name == "Transition":
		animation_camera.current = false;
		item_camera.current = true;
		animation_player.play("TransitionOut");
	elif name == "TransitionOut":
		set_process(true);

var prev_index = selection_index;
var current_selection = null;
func _process(_delta: float) -> void:
	#var dir = Input.get_action_strength("ui_left") - Input.get_action_strength("ui_right");
	#item_camera.rotation.y += dir * delta;
	if Input.is_action_just_pressed("ui_left"):
		selection_index += 1;
		_do_transition(prev_index, selection_index);
		current_selection = gacha_items[selection_index % num_rolls];
	elif Input.is_action_just_pressed("ui_right"):
		selection_index -= 1;
		_do_transition(prev_index, selection_index);
		current_selection = gacha_items[selection_index % num_rolls];
	prev_index = selection_index;
	

func _do_transition(prev, curr) -> void:
	# sample between the two indices
	var prev_angle = delta_theta * prev;
	var curr_angle = delta_theta * curr;
	if camera_tween:
		camera_tween.kill();
	camera_tween = get_tree().create_tween()
	item_camera.rotation.y = prev_angle;
	camera_tween.tween_property(item_camera, "rotation:y", 
		curr_angle, 0.2);
	pass


func _return_home() -> void:
	SceneManager.goto_scene(BgConstants.MAIN_SCREEN_PATH);
	


