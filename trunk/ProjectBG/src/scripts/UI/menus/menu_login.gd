extends Node

# nodes
@export var login_password : LineEdit;
@export var login_button : Button;
@export var login_username : LineEdit;
@export var login_notification : RichTextLabel;

@export var register_password : LineEdit;
@export var register_confirm : LineEdit;
@export var register_age_confirm : CheckBox;
@export var register_button : Button;
@export var register_username : LineEdit;
@export var register_notification : RichTextLabel;

@export var tab_container : TabContainer;


func _ready() -> void:
	if login_button.connect("pressed",self.login) != OK:
		print("Error connecting login button");
	if register_button.connect("pressed",Callable(self,"register")) != OK:
		print("Error connecting register button");
	if Firebase.Auth.connect("login_succeeded",Callable(self,"_login_succeeded")) != OK:
		print("Error connecting Firebase event");
	if Firebase.Auth.connect("signup_succeeded",Callable(self,"_signup_succeeded")) != OK:
		print("Error connecting Firebase event");
	if Firebase.Auth.connect("login_failed",Callable(self,"_login_failed")) != OK:
		print("Error connecting Firebase event");
	if Firebase.Auth.connect("signup_failed",Callable(self,"_signup_failed")) != OK:
		print("Error connecting Firebase event");


func login() -> void:
	login_button.visible = false;
	Firebase.Auth.login_with_email_and_password(login_username.text, login_password.text);


func register() -> void:
	register_button.visible = false;
	if register_password.text != register_confirm.text:
		register_notification.text = "Passwords are not matching";
		return;
	elif not register_age_confirm.toggle_mode:
		register_notification.text = "Please confirm your age";
		return;
	Firebase.Auth.signup_with_email_and_password(register_username.text, register_password.text);


func _login_succeeded(_result) -> void:
	login_notification.text = _get_formatted_bbcode("Login Successful");
	await get_tree().create_timer(1.0).timeout;
	SceneManager.goto_scene(BgConstants.WELCOME_SCENE_PATH);


func _signup_succeeded(_result) -> void:
	register_notification.text = _get_formatted_bbcode("Successfully Registered");
	await get_tree().create_timer(1.0).timeout;
	tab_container.current_tab = 0;


func _login_failed(_code, message) -> void:
	login_button.visible = true;
	login_notification.text = "[center]Login Failed\n" + message + "[/center]";


func _signup_failed(_code, message) -> void:
	register_button.visible = true;
	register_notification.text = "[center]Registration Failed\n" + message + "[/center]";


func _get_formatted_bbcode(text : String) -> String:
	return "\n[center][rainbow freq=1 sat=10 val=20][wave amp=50 freq=10]" + text + "[/wave][/rainbow][/center]\n";


