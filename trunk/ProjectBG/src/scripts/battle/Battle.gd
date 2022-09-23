extends Node

# from `battle.ts`
# export interface CombatSessionData {
#    id: string;
#    seed: number;
#    playerTeam: MemberInstance[];
#    enemyTeam: EnemyStageData;
#    expireAt: number;
#    flags?: any;
# }

# node paths
@export var player_team_path: NodePath;
@export var enemy_team_path: NodePath;

# loaded nodes
@onready var player_team : Node3D = get_node(player_team_path);
@onready var enemy_team : Node3D = get_node(enemy_team_path);

# variables
var combat_session : Dictionary;

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	combat_session = GlobalData.data.combat_session;
	BgConstants.remove_all_children(player_team);
	BgConstants.remove_all_children(enemy_team);
	
