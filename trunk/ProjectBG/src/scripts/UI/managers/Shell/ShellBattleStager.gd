extends ShellBaseMenu

# variables
@export var member_grid : GridContainer;
@export var start_battle : Button;

# constants
var ENTRY = load(BgConstants.GUILD_MEMBER_PATH);
const MAX_MEMBERS : int = 2;

# variables
var team = [];


func _ready() -> void:
	start_battle.connect("pressed",Callable(self,"try_start_battle"));


func try_start_battle() -> void:
	var start_call = Firebase.Functions.execute(BgConstants.SERVER_BATTLE + "/start",
		HTTPClient.METHOD_POST, {}, {"team" : team})
	start_call.connect("function_executed",Callable(self,"start_combat"));
	pass


func start_combat(_response, result) -> void:
	GlobalData.data.combat_session = result;
	SceneManager.goto_scene(BgConstants.BATTLESCENE_PATH);


func init(_params : Dictionary = {}) -> void:
	BgConstants.remove_all_children(member_grid);
	var members = GlobalData.player_members.members;
	for member in members:
		var inst : GuildEntry = ENTRY.instantiate();
		inst.init(member);
		inst.connect("pressed",Callable(self,"push_character").bind(inst));
		member_grid.add_child(inst);


func push_character(inst : GuildEntry) -> void:
	var character_data = inst.get_character_data();
	var contains = team.has(character_data.id);
	if not contains and team.size() < MAX_MEMBERS:
		team.push_back(character_data.id);
		inst.modulate = Color.GREEN;
	elif contains:
		team.erase(character_data.id);
		inst.modulate = Color.WHITE;


