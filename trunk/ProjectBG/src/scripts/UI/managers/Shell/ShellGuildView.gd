extends ShellBaseMenu


# variables
@export var guild_members_list : GridContainer;
@export var guild_display : Panel;

# constants
var ENTRY = preload(BgConstants.GUILD_MEMBER_PATH);


func init(_params : Dictionary) -> void:
	guild_display.visible = false;
	BgConstants.remove_all_children(guild_members_list);
	var members = GlobalData.player_members.members;
	for member in members:
		var inst : GuildEntry = ENTRY.instantiate();
		inst.init(member);
		inst.connect("pressed",Callable(self,"load_character").bind(inst));
		guild_members_list.add_child(inst);
	pass


func load_character(inst : GuildEntry) -> void:
	guild_display.visible = true;
	guild_display.load_character(inst.get_character_data());
	pass
