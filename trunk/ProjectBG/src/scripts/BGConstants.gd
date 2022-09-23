extends Node

# SCENES
const LOGIN_SCENE_PATH := "res://src/scenes/UI/menus/menu_loginscreen.tscn";
const STARTUP_SCENE_PATH := "res://src/scenes/UI/menus/menu_startup.tscn";
const WELCOME_SCENE_PATH := "res://src/scenes/UI/menus/menu_welcomescreen.tscn";
const MAIN_SCREEN_PATH := "res://src/scenes/UI/managers/Shell/Merged/Shell_MainMenu.tscn";
const MARKET_SCENE_PATH := "res://src/scenes/UI/managers/Shell/ShellMainScreen.tscn";
const BATTLESCENE_PATH := "res://src/scenes/battle/Battle.tscn";
const GACHA_ANIM_PATH := "res://src/scenes/shop/ShopGachaAnimation.tscn";

# RESOURCE PATHS
const BATTLE_MEMBER := "res://src/scenes/battle/Member.tscn";

# DEFAULT VALUES
const DEFAULT_ICON := preload("res://icon.png");

# COMPONENTS
const EXPEDITION_CARD_PATH : String = "res://src/scenes/UI/components/ExpeditionEntry.tscn";
const GUILD_MEMBER_PATH : String = "res://src/scenes/UI/components/GuildEntry.tscn";

# SERVER EXPRESS APPS
const SERVER_CHEATS := "cheats";
const SERVER_EXPEDITIONS := "expeditions";
const SERVER_SHOP := "shop";
const SERVER_GAMEDATA := "gamedata";
const SERVER_ADVENTURE := "adventure";
const SERVER_BATTLE := "battle";

# SHOP CONSTANTS
const UNKNOWN_COLOR : Color = Color.PURPLE;
const SHOP_GACHA_DISPLAY_ITEM_PATH = "res://src/scenes/shop/GachaDisplayItem.tscn";

# LOADING SCREEN
const LOADING_SCREEN_TIPS := ["Finishing all your daily expeditions will grant you a nice bonus",
	"Position your units for a strategic advantage", 
	"All recruiters need to go through recruiter school to receive the necessary training",
	"Do people actually read these?", "Consider buying a premium membership to support the game!",];

# UTILITY FUNCTIONS
func remove_all_children(node : Node) -> void:
	for n in node.get_children():
		node.remove_child(n);
		n.queue_free();

# STORAGE PATHS
func get_portrait_for(asset_folder : String) -> String:
	return asset_folder + "/Portrait.png";


func get_pose_for(asset_folder : String, pose_number : int) -> String:
	return asset_folder + "/Pose_" + str(pose_number) + ".png";


class BGRandomNumberGenerator:
# keep this updated with the same method and numbers as bgmath.ts on the server side
	const mult := 75;
	const increment := 74;
	const mod := 65537;
	var _seed_number : int;
	func _init(seed_number : int):
		_seed_number = seed_number;
	
	func generate() -> int:
		var x = _seed_number;
		_seed_number = (mult * x + increment) % mod;
		return _seed_number;
	
