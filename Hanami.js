define (["../graf/public_html/Test/TestSuite",
    "../graf/public_html/GraphMap/GraphMap.js",
    "../graf/public_html/Graph/Graph.js",
    "../graf/public_html/Graph/Node.js",
	"../graf/public_html/UI/DragHandler"],
function (TestSuite, GraphMap, Graph, Node, DragHandler) {

let SPEED_FACTOR = 6.66;
let CONSTANT_DOWN_SUMMAND = 1;

const WIDTH = 100
const OFFSET = 5

var grid_size = 5;
var sector_length = (WIDTH - 2*OFFSET) / grid_size;
var hanami_testsuite = new TestSuite ();
var grid_size;
var graph;
var graph_map;
var graph_opacity = 1;
var particles = [];

hanami_testsuite.add_test (test_graph_initialized);
hanami_testsuite.add_test (test_create_graph);
hanami_testsuite.add_test (test_create_graph_map);
hanami_testsuite.add_test (test_draw_circles);
hanami_testsuite.add_test (test_draw_lines);
hanami_testsuite.add_test (test_move_node);
hanami_testsuite.add_test (test_spawn_particle);
hanami_testsuite.add_test (test_update_particles);

function add_particles () {
	set_intervals();
	spawn_particle();
}

function invisible_graph() {
	create_graph();
	create_graph_map();
}

function visible_graph () {
	invisible_graph ()
	draw_circles();
	draw_lines();
}

function movable_graph () {
	visible_graph ();
	initialize_drag_handler();
}

function create_graph () {
	graph = new Graph ();
	for (var x = 0; x <= grid_size; x++) {
		for (var y = 0; y <= grid_size; y++) {
			var node = new Node ("x" + x + "y" + y);
			graph.add_node (node);
			add_edges(x, y, node);
		}
	}
}

function add_edges (x, y, node) {
	random_flag = Math.random ()
	if (random_flag > 0.5) {
		if (x > 0) {
			var node_left = graph.find_node("x" + (x-1) + "y" + y)
			graph.add_edge(node_left, node);
			graph.add_edge(node, node_left);
		}
		if (y > 0) {
			var node_top = graph.find_node("x" + x + "y" + (y-1));
			graph.add_edge(node_top, node);
			graph.add_edge(node, node_top);
		}
	}
}

function draw_lines () {
	graph.edges.forEach (edge => {
			positioned_node_a = graph_map.positioned_nodes [edge.node_a.id];
			positioned_node_b = graph_map.positioned_nodes [edge.node_b.id];
			var line = document.createElementNS ("http://www.w3.org/2000/svg", "line");
			line.setAttribute ("x1", positioned_node_a.x);
			line.setAttribute ("y1", positioned_node_a.y);
			line.setAttribute ("x2", positioned_node_b.x);
			line.setAttribute ("y2", positioned_node_b.y);
			line.setAttribute ("stroke", "var(--color-tertiary)");
			line.setAttribute ("stroke-width", 0.8);
			line.setAttribute ("stroke-opacity", graph_opacity);
			line.setAttribute ("id", edge.id);
			svg.prepend (line);
	});
	graph_map.callback_edge_position_changed = function (edge) {
		var line = document.getElementById (edge.id);
		positioned_node_a = graph_map.positioned_nodes [edge.node_a.id];
		positioned_node_b = graph_map.positioned_nodes [edge.node_b.id];
		line.setAttribute ("x1", positioned_node_a.x);
		line.setAttribute ("y1", positioned_node_a.y);
		line.setAttribute ("x2", positioned_node_b.x);
		line.setAttribute ("y2", positioned_node_b.y);
	}
}


function draw_circles () {
	for (var x = 0; x <= grid_size; x++) {
		for (var y = 0; y <= grid_size; y++) {
			var id = "x" + x + "y" + y;
			var positioned_node = graph_map.positioned_nodes[id];
			var circle = document.createElementNS ("http://www.w3.org/2000/svg", "circle");
			circle.setAttribute ("id", id);
			circle.setAttribute ("r", 1);
			circle.setAttribute ("cx", positioned_node.x);
			circle.setAttribute ("cy", positioned_node.y);
			circle.setAttribute ("class", "node");
			circle.setAttribute ("opacity", graph_opacity);
			svg.appendChild (circle);
		}
	}
	graph_map.callback_node_position_has_changed = function (id, position) {
		var circle = document.getElementById(id);
		circle.setAttribute("cx", position.x);
		circle.setAttribute("cy", position.y);
	}
}

function initialize_drag_handler() {
	var drag = new DragHandler("circle");
	drag.callback_drag = function (id, offset_x, offset_y) {
		graph_map.move_node (id, {x: offset_x * 100, y: offset_y * 100});
	};
	drag.callback_mouse_over = function (id) {
		var circle = document.getElementById (id);
		circle.style.fill = "var(--color-tertiary)";
		circle.style.stroke = "var(--color-primary)";
	}
	drag.callback_mouse_leave = function (id) {
		var circle = document.getElementById (id);
		circle.style.fill = "var(--color-primary)";
		circle.style.stroke = "var(--color-tertiary)";
	}
}

function create_graph_map () {
	graph_map = new GraphMap (graph, null, true);
	for (var x = 0; x <= grid_size; x++) {
		for (var y = 0; y <= grid_size; y++) {
			var id = "x" + x + "y" + y;
			var random_addition = (-0.5 + Math.random ()) * 2;
			var position_x = OFFSET + x * sector_length + random_addition;
			var position_y = OFFSET + y * sector_length + random_addition;
			graph_map.change_node_position ("x"+x+"y"+y, {x: position_x, y: position_y});
		}
	}
}

function update_particles () {
	particles.forEach (particle => {
			var position = get_particle_position (particle);
			if (position.y > 100) {
			particle.remove ();
			}
			var sum_vector = graph_map.vector_matrix.get_sum_vector_at_position (position, 2);
			if (sum_vector) {
			var delta_x = sum_vector [0]  * (SPEED_FACTOR/100);
			var delta_y = (sum_vector [1] + CONSTANT_DOWN_SUMMAND) * (SPEED_FACTOR/100)
			set_particle_position (particle, position [0] + delta_x, position[1] + delta_y);
			}
			})
}

function get_particle_position(particle) {
	var particle_x = parseFloat(particle.getAttribute("cx"));
	var particle_y = parseFloat(particle.getAttribute("cy"));
	return [particle_x, particle_y];
}

function spawn_particle () {
	var particle = document.createElementNS ("http://www.w3.org/2000/svg", "circle");
	particle.setAttribute ("r", "0.5");
	particle.setAttribute ("fill", "var(--color_tertiary)");
	particle.setAttribute ("stroke", "var(--color-primary)")
		particle.setAttribute ("stroke-width", "0.66")
		set_particle_position(particle, Math.random ()* 100, 0);
	svg.prepend (particle);
	particles.push (particle);
}

function set_particle_position(particle, x, y) {
	particle.setAttribute("cx", x);
	particle.setAttribute("cy", y);
}

function set_intervals() {
	setInterval(update_particles, 1000 / 60);
	setInterval(spawn_particle, 1000);
}

function test_update_particles () {
	spawn_particle ();
	var old_x = particles[0].getAttribute ("cx");
	update_particles ();
	var new_x = particles[0].getAttribute ("cx");
	var test = old_x != new_x;
	console.assert (test, test_update_particles.name + " failed!");
	$("#svg").empty ();
	return test;
}

function test_spawn_particle () {
	spawn_particle ();
	var test = particles[0] != null;
	console.assert (test, test_spawn_particle.name + " failed!");
	$("#svg").empty ();
	return test;
}

function test_move_node () {
	create_graph ();
	create_graph_map ();
	draw_circles ();
	draw_lines ();
	graph_map.change_node_position ("x0y0", {x: 50, y: 50});
	var line = document.getElementById ("x0y0-x1y0");
	test = line.getAttribute ("x1") == 50;
	console.assert (test, test_move_node.name + " failed!");
	$("#svg").empty ();
	return test;
}

function test_draw_lines () {
	create_graph ();
	create_graph_map ();
	draw_circles ();
	draw_lines ();
	var test = document.getElementById ("x0y0-x0y1") != null;
	console.assert (test, test_draw_lines.name + " failed!");
	$("#svg").empty ();
	return test;
}

function test_draw_circles () {
	create_graph ();
	create_graph_map ();
	draw_circles ();
	var test = document.getElementById ("x0y0").getAttribute ("cx") != null;
	console.assert (test, test_draw_circles.name + " failed!");
	$("#svg").empty ();
	return test;
}

function test_graph_initialized () {
	create_graph ();
	var test = (typeof (graph) != "undefined");
	console.assert (test, test_graph_initialized.name + " failed!");
	return test;
}

function test_create_graph () {
	create_graph ();
	var test = graph.find_node ("x3y3") != null;
	var test2 = graph.find_edge ("x0y0", "x0y1") != null;
	console.assert (test&&test2, test_create_graph.name + " failed!");
	return test&&test2;
}

function test_create_graph_map () {
	create_graph ();
	create_graph_map ();
	var test = graph_map.positioned_nodes ["x2y0"].x > 5;
	console.assert (test, test_create_graph_map.name + " failed!");
	return test;
}

return function play_hanami (_stage) {
	if (_stage == 0) {
		invisible_graph ();
		add_particles ();
	}else if (_stage == 1) {
		graph_opacity = 0.19; 
		visible_graph ();
		add_particles ();
	}else if (_stage == 2) {
		graph_opacity = 0.35; 
		visible_graph ();
		add_particles ();
	}else if (_stage == 3) {
		movable_graph ();
		add_particles ();
	}
}

})