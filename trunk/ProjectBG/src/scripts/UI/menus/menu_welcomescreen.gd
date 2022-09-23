extends CanvasLayer

# loaded nodes
@export var fun_fact_text : RichTextLabel;
@export var fun_fact_timer : Timer;

# vars
var rng = RandomNumberGenerator.new();
func _ready() -> void:
	_cycle_text();
	GlobalData.connect("received_gamedata",Callable(self,"_transition"));
	GlobalData.load_game_data();


func _cycle_text() -> void:
	while true:
		var display = "Tip: " + _get_random_tip();
		fun_fact_text.text = "[center]" + display + "[/center]";
		fun_fact_timer.start();
		await fun_fact_timer.timeout;
	pass


func _transition() -> void:
	# await get_tree().create_timer(0.5).timeout;
	SceneManager.goto_scene(BgConstants.MAIN_SCREEN_PATH);


func _get_random_tip() -> String:
	var index = rng.randi_range(0, len(BgConstants.LOADING_SCREEN_TIPS) - 1);
	return BgConstants.LOADING_SCREEN_TIPS[index];
