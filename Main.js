require (
    ["../graf/public_html/Browser/Tab.js",
    "./Hanami.js"], 
function (Tab, Hanami) {

let CSS_COLOR_VARIABLES = ["--color-primary", "--color-secondary", "--color-tertiary"]
const STAGE_URL_TAG = "s";
const COLOR_URL_TAG = "c"
const DEFAULT_HANAMI_STAGE = 3; 
const COLOR_SCHEMES = [ 
	["TOKYO CHEWING GUM", "rgb(251, 151, 218)", "rgb(34, 34, 34)", "rgb(255, 255, 255)"],
	["FLAMENCO WITH HER", "rgb(255, 255, 255)", "rgb(255, 0, 0", "rgb(136, 0, 0)"],
	["A BAD SIGN", "rgb(0, 0, 0", "rgb(84, 222, 255)", "rgb(255, 200, 200)"],
	["ABENDLICHTER", "rgb(255, 255, 255)", "rgb(49, 49, 49)", "rgb(215, 76, 76)"],
	["NINA LILA PROSTITUIERTE", "rgb(255, 0, 0)", "rgb(155, 98, 98)", "rgb(96, 51, 98)"],
	["BITTE GLAUB DEN STERNEN", " rgb(255, 255, 255)", "rgb(21, 21, 16)", "rgb(0, 0, 0)"],
	["WASABI", " rgb(212, 255, 170)", "rgb(1, 181, 155)", "rgb(80, 255, 0)"],
	["CHRISTMAS BOARDGAMES NUSSKNACKER", " rgb(245, 18, 18)", "rgb(255, 182, 44)", "rgb(24, 54, 10)"],
	["HANAMI", "rgb(255, 202, 244)", "rgb(107, 42, 42)", "rgb(122, 230, 255)"],
    ["STREETWORKERS", "rgb(0, 190, 234", "rgb(255, 209, 250)", "rgb(230, 233, 255)"]
]
var stage;
var tab; 
//
$(document).ready(function () {
    handle_url ();
    init_levels();
    grab_svg();
    Hanami (stage);
});

function init_levels() {
    levels = [Hanami];
}

function grab_svg() {
    svg = document.getElementById("svg");
}

function handle_url () {
    tab = new Tab("Hanami");
    tab.url_parameter_ids.push (COLOR_URL_TAG)
    tab.url_parameter_ids.push(STAGE_URL_TAG);
    handle_color_scheme ();
    set_stage_from_url ();
}

function handle_color_scheme () {
    var color_in_url = set_color_scheme_from_url ();
    if (color_in_url == false) {
        set_random_color_scheme ();
    }
}

function set_color_scheme_from_url () {
    var index = tab.url_parameters[COLOR_URL_TAG] 
    if (index >= 0 && index < COLOR_SCHEMES.length) {
        var color_scheme = COLOR_SCHEMES [index];
        set_color_scheme (color_scheme);
    }else {
        return false;
    }
}

function set_random_color_scheme () { 
	random_index = Math.floor (Math.random () * COLOR_SCHEMES.length)
	var color_scheme = COLOR_SCHEMES [random_index]
	set_color_scheme (color_scheme)
}

function set_color_scheme (color_scheme) {
	if (color_scheme) {
		for (var i = 0; i < 3; i++) {
			variable_name = CSS_COLOR_VARIABLES [i]
			var color = color_scheme [i+1]
			document.documentElement.style.setProperty(variable_name, color);
		}
	}else {
		set_random_color_scheme ();
	}
}

function set_stage_from_url() {
    var value = tab.url_parameters[STAGE_URL_TAG];
    stage = value ? value : DEFAULT_HANAMI_STAGE
}

function change_level (index) {
    clear_svg ();
    clear_timeouts ();
    try {
        levels [index] ()
    }catch {

    }
}

function clear_timeouts () {
    var id = window.setTimeout(function() {}, 0);
    while (id--) {
        window.clearTimeout(id); // will do nothing if no timeout with id is present
    }
}

function clear_svg () {
    $("#svg").empty ()
}

})
