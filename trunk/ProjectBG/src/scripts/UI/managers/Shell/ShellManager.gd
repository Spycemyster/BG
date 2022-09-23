extends CanvasLayer

# Holds a collection of multiple scenes that require quick and easy transitions
# to other scenes.
class_name ShellManager

# loaded nodes
@export var base_scene : Node;
@export var shells_parent : Node;
@export var back_button : Button;
@export var blur : ColorRect;

# variables
var _shells := {};
var _shell_stack := [];
var _popup_stack := [];


func _ready() -> void:
	var shells = shells_parent.get_children();
	assert(len(shells) > 0) ;#,"No shells loaded onto shell manager")
	back_button.connect("pressed",Callable(self,"back_out"));
	for curr in shells:
		_shells[curr.get_name()] = curr;
		curr.connect("change_to",Callable(self,"_internal_change"));
		curr.connect("pop_scene",Callable(self,"back_out"));
		curr.visible = false;
		pass;
	open_shell(base_scene.get_name(), {});


# opens a shell scene
func open_shell(shell_name : String, params : Dictionary) -> void:
	var has_shell = _shells.has(shell_name);
	if not has_shell:
		printerr(shell_name + " shell was not found in shell manager.");
		return;
	if _shell_stack.find(_shells[shell_name]) != -1:
		push_warning(shell_name + " is already in list of opened shells");
	if !_shell_stack.is_empty():
		_shell_stack.back().visible = false;
	_shell_stack.push_back(_shells[shell_name]);
	_shell_stack.back().visible = true;
	_shell_stack.back().init(params);
	back_button.visible = _shell_stack.size() > 1;


# create a popup and place it checked the screen
func push_popup(_popup_path : String, _params : Dictionary, _blur_background : bool = false) -> void:
	push_error("NOT IMPLEMENTED YET");


# closes the current popup
func close_popup() -> void:
	_popup_stack.pop_back();
	push_error("NOT IMPLEMENTED YET");
	if _popup_stack.is_empty():
		blur.visible = false;

# backs out of the current shell
func back_out() -> void:
	if _shell_stack.size() <= 1:
		printerr("No other scene to back into");
		return;
	_shell_stack.back().visible = false;
	_shell_stack.pop_back();
	_shell_stack.back().visible = true;
	back_button.visible = _shell_stack.size() > 1;


func _internal_change(next_scene : String, params : Dictionary) -> void:
	open_shell(next_scene, params);
