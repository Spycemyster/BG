extends Control

@export var logos : Array[Texture2D];
var logo_index := 0;


func _ready() -> void:
	SceneManager.goto_scene(BgConstants.LOGIN_SCENE_PATH);
