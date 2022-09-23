extends ShellBaseMenu

# Displays all the main options for the game
class_name ShellMainScreen

# loaded nodes
@export var expedition : Button;
@export var signout : Button;
@export var market : Button;
@export var battle : Button;
@export var guild : Button;
@export var adventure : Button;


func _ready() -> void:
	if expedition.connect("pressed",Callable(self,"open_expedition")) != OK:
		push_error("Couldn't connect expeditions");
	if signout.connect("pressed",Callable(self,"sign_out")) != OK:
		push_error("Couldn't connect signout");
	if market.connect("pressed",Callable(self,"open_market")) != OK:
		push_error("Couldn't connect market");
	if battle.connect("pressed",Callable(self,"open_battle")) != OK:
		push_error("Couldn't connect battle");
	if guild.connect("pressed",Callable(self,"open_guild")) != OK:
		push_error("Couldn't connect guild");
	if adventure.connect("pressed",Callable(self,"open_adventure")) != OK:
		push_error("Couldn't connect adventure");

func open_adventure() -> void:
	change_to_shell("Adventure", {});
	pass


func open_guild() -> void:
	change_to_shell("Guild", {});
	pass


func open_market() -> void:
	change_to_shell("Market", {});
	pass


func open_battle() -> void:
	change_to_shell("Battle", {});
	pass


func sign_out() -> void:
	Firebase.Auth.logout();
	SceneManager.goto_scene(BgConstants.LOGIN_SCENE_PATH);


func open_expedition() -> void:
	change_to_shell("Expeditions", {});
	pass












