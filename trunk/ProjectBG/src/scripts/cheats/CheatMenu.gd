extends CanvasLayer


# node paths
@export var set_money_btn_path : NodePath;
@export var set_money_line_path : NodePath;
@export var add_money_btn_path : NodePath;
@export var add_money_line_path : NodePath;


# loaded variables
@onready var add_money_btn : Button = get_node(add_money_btn_path);
@onready var add_money_line : LineEdit = get_node(add_money_line_path);
@onready var set_money_btn : Button = get_node(set_money_btn_path);
@onready var set_money_line : LineEdit = get_node(set_money_line_path);


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	set_process(false);
	add_money_btn.connect("pressed",Callable(self,"_add_money"));
	set_money_btn.connect("pressed",Callable(self,"_set_money"));
	pass


func _add_money() -> void:
	var amount = add_money_line.text.to_int();
	var exec = Firebase.Functions.execute(BgConstants.SERVER_CHEATS + "/addMoney/"\
		+ str(amount), HTTPClient.METHOD_GET);
	await exec.function_executed;
	print("Successfully added " + str(amount) + " to player inventory");
	pass


func _set_money() -> void:
	var amount = add_money_line.text.to_int();
	var exec = Firebase.Functions.execute(BgConstants.SERVER_CHEATS + "/setMoney/"\
	+ str(amount), HTTPClient.METHOD_GET);
	await exec.function_executed;
	print("Successfully set money to " + str(amount));
	pass


func _input(event: InputEvent) -> void:
	if event.is_action_pressed("toggle_cheat_menu"):
		visible = !visible;
		print("Toggled cheat menu");
	pass
