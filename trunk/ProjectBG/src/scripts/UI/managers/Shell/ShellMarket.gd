extends ShellBaseMenu

# Displays stock from the game's market.
#
# Display all the items retrieved from the server. Allow the player to buy
# the stock and pull for characters/items.
class_name ShellMarket


# node paths
@export var roll_btn_path : NodePath;


# loaded nodes
@onready var roll_btn : Button = get_node(roll_btn_path);


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	roll_btn.connect("pressed",Callable(self,"roll_gacha"));
	pass # Replace with function body.


func roll_gacha() -> void:
	var roll = Firebase.Functions.execute(BgConstants.SERVER_SHOP + "/rollGacha",
		HTTPClient.METHOD_GET);
	roll.connect("function_executed",Callable(self,"play_gacha_animation"));
	roll.connect("task_finished",Callable(self,"btn_response"));
	roll_btn.visible = false;
	pass


func btn_response(_code) -> void:
	pass

func play_gacha_animation(_response, result) -> void:
	GlobalData.data.roll_data = result;
	print(result);
	SceneManager.goto_scene(BgConstants.GACHA_ANIM_PATH);
	pass


func init(_params : Dictionary) -> void:
	roll_btn.visible = true;
	pass

