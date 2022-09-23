extends Node

signal received_gamedata();

var data : Dictionary;
var member_list : Dictionary;
var item_list : Dictionary;
var world_list : Dictionary;
var player_data : Dictionary;
var player_inventory : Dictionary;
var player_members : Dictionary;
# clears the persistent data once we're done using it
func clear() -> void:
	data.clear();


func load_game_data() -> void:
	var get_player = Firebase.Functions.execute(BgConstants.SERVER_GAMEDATA
		+ "/getPlayerData", HTTPClient.METHOD_GET);
	var player_dict = await get_player.function_executed;
	player_data = player_dict[1].playerdata;
	player_inventory = player_dict[1].inventory;
	player_members = player_dict[1].members;
	var get_members = Firebase.Functions.execute(BgConstants.SERVER_GAMEDATA
		+ "/getMemberDataList", HTTPClient.METHOD_GET);
	var member_dict = await get_members.function_executed;
	member_list = member_dict[1];
	var get_items = Firebase.Functions.execute(BgConstants.SERVER_GAMEDATA
		+ "/getItemList", HTTPClient.METHOD_GET);
	var item_dict = await get_items.function_executed;
	item_list = item_dict[1];
	var get_worlds = Firebase.Functions.execute(BgConstants.SERVER_GAMEDATA
		+ "/getWorldList", HTTPClient.METHOD_GET);
	var worlds_dict = await get_worlds.function_executed;
	world_list = worlds_dict[1];
	emit_signal("received_gamedata");
