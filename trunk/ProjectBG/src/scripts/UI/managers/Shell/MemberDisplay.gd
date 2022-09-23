extends Panel


# node paths
@export var name_path : NodePath;
@export var level_path : NodePath;
@export var exp_path : NodePath;
@export var pose_path : NodePath;
@export var stars_path : NodePath;
@export var star1_path : NodePath;
@export var star2_path : NodePath;
@export var star3_path : NodePath;
@export var star4_path : NodePath;
@export var star_timer_path : NodePath;
@export var full_name_label_path : NodePath;
@export var job_label_path : NodePath;
@export var bio_label_path : NodePath;


# loaded variables
@onready var member_name : RichTextLabel = get_node(name_path);
@onready var level : RichTextLabel = get_node(level_path);
@onready var experience : RichTextLabel = get_node(exp_path);
@onready var pose : TextureRect = get_node(pose_path);
@onready var stars : HBoxContainer = get_node(stars_path);
@onready var star1 : TextureButton = get_node(star1_path);
@onready var star2 : TextureButton = get_node(star2_path);
@onready var star3 : TextureButton = get_node(star3_path);
@onready var star4 : TextureButton = get_node(star4_path);
@onready var star_timer : Timer = get_node(star_timer_path);
@onready var full_name_label : RichTextLabel = get_node(full_name_label_path);
@onready var job_label : RichTextLabel = get_node(job_label_path);
@onready var bio_label : RichTextLabel = get_node(bio_label_path);

# constants
const GRADES : int = 3;


# vars
var asset_folder : String;

func _ready() -> void:
	stars.visible = true;
	star1.connect("pressed",Callable(self,"load_pose").bind(1));
	star2.connect("pressed",Callable(self,"load_pose").bind(2));
	star3.connect("pressed",Callable(self,"load_pose").bind(3));
	star4.connect("pressed",Callable(self,"load_pose").bind(4));

func load_character(character_data : Dictionary) -> void:
	asset_folder = character_data.data.assetFolder;
	member_name.text = character_data.data.nickname;
	full_name_label.text = character_data.data.fullName;
	job_label.text = character_data.data.job;
	bio_label.text = character_data.data.biography;
	level.text = "level " + str(character_data.level);
	load_pose(1);


func load_pose(pose_number : int) -> void:
	var first_path = "user://" + BgConstants.get_pose_for(\
		asset_folder, pose_number);
	await Downloader.get_file(BgConstants.get_pose_for(
		asset_folder, pose_number), first_path);
	pose.texture = Downloader.create_texture(first_path);
	pass
