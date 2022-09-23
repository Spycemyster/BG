extends ShellBaseMenu

class_name ShellExpeditions

# loaded nodes
@export var refresh : RichTextLabel;
@export var expeditions : VBoxContainer;

# constants
const REFRESH_TIME = 24 * 60 * 60;
var EXPEDITION_CARD = load(BgConstants.EXPEDITION_CARD_PATH);
var DEFAULT_ICON : Texture2D = BgConstants.DEFAULT_ICON;

# variables
var cards : Array = [];
var start_times : Array;
var completion_times : Array;
var creation_time = -1;
var is_daily_collected : bool = false;
var current : int = -1;
const MINUTE_SECONDS_FORMAT = TimeFormatter.Format.SECONDS | TimeFormatter.Format.MINUTES;
var is_initialized := false;

func _ready() -> void:
	pass

func init(_params : Dictionary = {}) -> void:
	# retrieve a list of expeditions from the server
	set_process(false);
	refresh.text = "Loading...";
	var get_list = Firebase.Functions.execute("expeditions/getList", HTTPClient.METHOD_GET);
	get_list.connect("function_executed",Callable(self,"initialize_list"));
	get_list.connect("task_error",Callable(self,"error"));
	await get_list.task_finished;
	refresh.text = "Done loading!";
	set_process(true);
	pass


func error(_code, _status, message) -> void:
	print(message);
	back_out();


func initialize_list(response : int, result : Dictionary) -> void:
	if (result.creationTime - creation_time) / 1000 < REFRESH_TIME:
		print("Current expedition list already up to date");
		return;
	
	# delete any pre-existing expeditions
	cards.clear();
	for n in expeditions.get_children():
		expeditions.remove_child(n);
		n.queue_free();
	
	# create new expedition cards
	var missions : Array = result.missions;
	completion_times = result.completionTime;
	start_times = result.startTimes;
	current = result.current;
	is_daily_collected = result.isDailyCollected;
	for i in range(len(missions)):
		var mission = missions[i];
		var new_card : ExpeditionEntry = EXPEDITION_CARD.instantiate();
		expeditions.add_child(new_card);
		new_card.index = i;
		new_card.description.text = mission.body;
		new_card.title.text = mission.name;
		new_card.timestamp.text = TimeFormatter.GetFormattedTime(
			completion_times[i] / 1000, MINUTE_SECONDS_FORMAT);
		await Downloader.get_file(mission.icon, "user://" + mission.icon);
		var icon = Downloader.create_texture("user://" + mission.icon);
		if icon != null:
			new_card.icon.texture = icon;
		else:
			new_card.icon.texture = DEFAULT_ICON;
		new_card.connect("start_expedition",Callable(self,"start_expedition"));
		new_card.connect("collect_reward",Callable(self,"collect_reward"));
		new_card.completed_label.visible = false;
		new_card.start.visible = false;
		new_card.collect.visible = false;
		cards.push_back(new_card);
	print("Server responded with code " + str(response));
	creation_time = result.creationTime;
	is_initialized = true;


func start_expedition(index : int) -> void:
	var start = Firebase.Functions.execute("expeditions/start/" + str(index),
		HTTPClient.METHOD_GET, {"idx": str(index)});
	start.connect("function_executed",Callable(self,"_expedition_started"));
	start.connect("task_error",Callable(self,"error"));


func _expedition_started(response, result) -> void:
	print("-- Expedition --");
	print(response);
	print(result);
	print("----------------")
	_refresh_scene();


func collect_reward(index : int) -> void:
	var collect = Firebase.Functions.execute(
		"expeditions/collectReward/" + str(index), HTTPClient.METHOD_GET);
	collect.connect("function_executed",Callable(self,"_reward_collected"));
	collect.connect("task_error",Callable(self,"error"));


func _reward_collected(response, result) -> void:
	print("-- Reward --");
	print(response);
	print(result);
	print("------------");
	_refresh_scene();


func _refresh_scene() -> void:
	if not is_initialized:
		return
	is_initialized = false;
	current = -1;
	creation_time = -1;
	init();


func _process(_delta: float) -> void:
	_reload();


func _reload() -> void:
	var current_delta = REFRESH_TIME - get_elapsed_time(creation_time);
	var format = TimeFormatter.GetFormattedTime(current_delta,
		TimeFormatter.Format.SECONDS | TimeFormatter.Format.MINUTES
		| TimeFormatter.Format.HOURS | TimeFormatter.Format.DAYS);
	refresh.text = "Refreshes in " + format;
	
	# update cards
	var not_current_started : bool = (current == -1) or \
		get_elapsed_time(start_times[current] >= completion_times[current] / 1000);
	
	var exists_ongoing = current != -1 and start_times[current] != -1\
		and start_times[current] != -2 and\
		get_elapsed_time(start_times[current]) < completion_times[current] / 1000;
	for i in range(len(cards)):
		var card = cards[i];
		var is_current := current == i;
		var is_collected : bool = start_times[i] == -2;
		var is_completed : bool = start_times[i] != -1 and (is_collected or \
			get_elapsed_time(start_times[i]) >= completion_times[i] / 1000);
		var is_ongoing : bool = is_current and not is_completed;
		card.start.visible = not exists_ongoing and not_current_started and \
			not is_ongoing and not is_collected and not is_completed;
		card.completed_label.text = "ONGOING" if is_ongoing else "COMPLETED";
		card.completed_label.visible = (is_completed and is_collected) or is_ongoing;
		card.collect.visible = is_completed and not is_collected;
		if is_ongoing:
			var time_left = completion_times[current] / 1000 - get_elapsed_time(start_times[current]);
			card.timestamp.text = TimeFormatter.GetFormattedTime(time_left, MINUTE_SECONDS_FORMAT);
		else:
			card.timestamp.text = TimeFormatter.GetFormattedTime(
				completion_times[i] / 1000, MINUTE_SECONDS_FORMAT);
		
		if is_completed:
			card.timestamp.text = "";


func get_elapsed_time(from : int) -> int:
	return int(floor(Time.get_unix_time_from_system() - from / 1000.0));






