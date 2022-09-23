extends TextureButton

class_name GuildEntry

var _member_data : Dictionary;
var _instance_data : Dictionary;
var exists : bool = true;
func init(member_name : String) -> void:
	if GlobalData.member_list.get(member_name) == null:
		exists = false;
		return;
	_member_data = GlobalData.member_list.get(member_name, null);
	_instance_data = GlobalData.player_members.members.get(member_name, null);
	await Downloader.get_file(BgConstants.get_portrait_for(_member_data.assetFolder), 
		"user://" + BgConstants.get_portrait_for(_member_data.assetFolder));
	texture_normal = Downloader.create_texture("user://" + BgConstants.get_portrait_for(_member_data.assetFolder));


func get_character_data() -> Dictionary:
	return {
		"id" : _instance_data.id,
		"data" : _member_data,
		"quantity" : _instance_data.quantity,
		"exp" : _instance_data.exp,
		"level" : _instance_data.level,
		"equipped" : _instance_data.equipped,
	};
