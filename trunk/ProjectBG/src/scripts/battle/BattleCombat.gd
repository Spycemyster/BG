@tool

extends Node
# result
# - moveHistory : Array<Move[]>
# - teamA : Map<string, MemberData>
# - teamB : Map<string, MemberData>
#
# MemberData
# fullName: string;
# nickname?: string;
# rarity: Rarity;
# job: GuildJob;
# baseStats: BaseStats;
# biography: string;
# equipped?: any;
# assetFolder: string;
#
# Move
# entity: string;
# move: MoveType;
# moveData?: any;
# target?: string;
# newPosition?: Position;

# nodepaths
@export var map_path: NodePath;
@export var camera_path: NodePath;
@export var characters_path: NodePath;

# loaded
@onready var map : Node2D = get_node(map_path);
@onready var characters : Node2D = get_node(characters_path);
@onready var camera : Camera2D = get_node(camera_path);

# constants
var MEMBER_INSTANCE = load(BgConstants.BATTLE_MEMBER);
@export var grid_texture : Texture2D;
const START_HEIGHT : int = 3;
const WIDTH : int = 10;
const HEIGHT : int = 7;
const RATIO : float = 0.7742918852;


# simulation variables
var data : Dictionary;
var entities : Dictionary = {};
var is_playing : bool = false;
var move_history_index : int = 0;

func _ready() -> void:
	set_process(false);
	var cam_pos : Vector2 = index_to_board(WIDTH / 2, HEIGHT / 2);
	camera.set_position(cam_pos);
	
	# initialize the map based checked the given specs
	for i in range(WIDTH):
		for j in range(HEIGHT):
			var sprite = Sprite2D.new();
			sprite.texture = grid_texture;
			sprite.position = index_to_board(i, j);
			map.add_child(sprite);
	if GlobalData.data != null:
		await get_tree().create_timer(1.0).timeout;
		play_result(GlobalData.data["battle_results"]);


func index_to_board(x : int, y : int) -> Vector2:
	return Vector2(x * grid_texture.get_width() + (y % 2) * grid_texture.get_width() / 2,
		y * grid_texture.get_height() * RATIO);


func play_result(result : Dictionary) -> void:
	entities.clear();
	data = result.duplicate(true);
	is_playing = true;
	move_history_index = 0;
	var move_history = data["moveHistory"];
	var length = len(move_history);
	var texture = load("res://icon.png");
	var team_A : Dictionary = data.teamA;
	var team_A_stats : Dictionary = data.statsA;
	var team_A_init_pos : Dictionary = data.initPositionA;
	var team_B : Dictionary = data.teamB;
	var team_B_stats : Dictionary = data.statsB;
	var team_B_init_pos : Dictionary = data.initPositionB;
	
	# arrange the team entities checked their respective tiles
	# team A
	for uid in team_A.keys():
		var name = team_A[uid];
		var position = team_A_init_pos[uid];
		var member = GlobalData.member_list[name];
		var stats = team_A_stats[uid];
		var character = create_character(stats, texture, member, uid);
		characters.add_child(character);
		character.connect("death",Callable(self,"_character_death"));
		character.set_position(index_to_board(int(position.x), int(position.y)));
		entities[uid] = character;
		pass
	
	# team B
	for uid in team_B.keys():
		var name = team_B[uid];
		var position = team_B_init_pos[uid];
		var member = GlobalData.member_list[name];
		var stats = team_B_stats[uid];
		var character = create_character(stats, texture, member, uid);
		characters.add_child(character);
		character.connect("death",Callable(self,"_character_death"));
		entities[uid] = character;
		character.set_position(index_to_board(int(position.x), int(position.y)));
		pass
	
	# sequentially play each batch of moves from the move history
	while move_history_index < length:
		var moves = move_history[move_history_index];
		for i in range(len(moves)):
			var move = moves[i];
			print(move);
			perform_move(move.get("entity", null), move.get("move", null),
				move.get("moveData", null), move.get("target", null),
				move.get("newPosition", null));
		await get_tree().create_timer(1).timeout;
		move_history_index += 1;
		pass
	var winner = data.winner;
	if winner == -1:
		print("Burnt out. Both lose.");
	elif winner == 0:
		print("Defenders win");
	elif winner == 1:
		print("Attackers win");
	else:
		print("What the fuggle just happened.");
	await get_tree().create_timer(1.0).timeout;
	return_home();

func return_home() -> void:
	SceneManager.goto_scene(BgConstants.MAIN_SCREEN_PATH);
	pass


func _character_death(member) -> void:
	entities[member.uid].queue_free();
	entities.erase(member.uid);
	pass

func create_character(stats, texture, member, uid):
	var character = MEMBER_INSTANCE.instantiate();
	character.health = stats.health;
	character.max_health = stats.health;
	character.texture = texture;
	character.uid = uid;
	return character;


func perform_move(entity, move, moveData, target, new_position) -> void:
	match move:
		"attack":
			entities[target].damage(int(moveData));
			pass;
		"walk":
			entities[entity].set_position(index_to_board(int(new_position.x),
				int(new_position.y)));
			pass;
	pass
