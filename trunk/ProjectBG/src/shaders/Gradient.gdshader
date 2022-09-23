shader_type canvas_item;
render_mode unshaded;

uniform bool is_vertical;
uniform vec4 start_color : source_color;
uniform vec4 end_color : source_color;

void fragment()
{
	float vertical = float(is_vertical);
	float interp = UV.y * vertical + UV.x * (1.0 - vertical);
	COLOR = mix(start_color, end_color, interp);
}
