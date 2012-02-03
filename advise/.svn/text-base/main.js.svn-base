var SEMHEIGHT = 50; //semester height in pixels
var courses = null;
var rules = null;
var rulesobjs = {}; //maps from rule name to rule objects
var rulescategories = null;
var majors = null;
var offeringSems = null; //a list of integers corresponding to indices of course offerings

//status flags
var currentlySaving = false; //a serialized copy of the currently-saving schedule

var curuser = {};	//logged-in user information

/*
Todo:
Increase speed of scheduleHasCourse by caching the contents

Findables:
HACK
TODO

Element prefixes:
sem#: main semester block
sdesc#: semester description block
sem-#-#: semester tick box
*/

var pageLayout, southLayout, manageLayout;
$(document).ready(function(){
	pageLayout = $("body").layout({
		north: {
			resizable: false,
			closable: false,
			minSize: 25,
			maxSize: 25,
			spacing_open: 0
		},
		south: {
			onresize: "southLayout.resizeAll"
		},
		center: {
			onresize: "ContentPane.cur().resize"
		}
	});
	southLayout = $("div.ui-layout-south").layout({
		west: {
			paneSelector: ".bottom-inner-west"
		},
		center: {
			paneSelector: ".bottom-inner-center",
			onresize: resizeRules
		}
	});
	
	curuser = new User(User.GUEST_NAME, User.GUEST_PASS, doload);
});

/**
Perform vertical resizing and show/hiding for rules on the bottom scroll panel
*/
function resizeRules() {
	var bottomel = $("div.bottom-inner-center");
	var h = bottomel.height();
	
	//magical fudge factor for scroll bar size
	var sbf = ($.browser.msie) ? 20:20;
	$("#rulesarea").children().each(function(i, el) {
		var qel = $(el);
		qel.css({
			"height":(h-(20+sbf))+"px"
		});
		/*$(qel.children()[1]).css({
			"height":(h-(40+sbf))+"px"
		})*/
		Rules.showhide(qel, qel.data("showing"));
	});
	positionRules();
}

function positionRules() {
	var curl = 0;
	$("#rulesarea").children().each(function(i, el) {
		if ($(el).css("display") != "none") {
			$(el).css("left", curl);
			curl += $(el).width();
		}
	});
}

/**
Begin the process of loading the main interface
*/
function doload() {
	//Build the semester block UI:
	//divs for "semesters", which contain...
	//	description blocks (at left), with semester dropdowns
	//	"semblock" areas, which contain "ticks" for individual credits
	var allsemblock = $("<div>").addClass("allSemBlock");
	for (var x = 0; x < Ticks.NUMSEMS; ++x) {
		var semblock = null;
		var sem = $("<div>")
			.addClass("semester")
			.append(
				$("<div>")
					.addClass("semdesc")
					.append(
						$("<select>")
							.attr("id","sdesc" + x)
							.change(Semesters.eventchange)
					)
			)
			.append(
				semblock = $("<div>").addClass("semblock").attr("id", "sem" + x)
			);
		for (var y = 0; y < Ticks.MAXCREDITS; ++y) {
			semblock.append(
				$("<div>")
					.addClass("semtick")
					.html((y+1))
					.css(Ticks.origTickStyle(x,y))
					.attr("id","sem-" + x + "-" + y)
			);
		}
		allsemblock.append(sem);
	}

	$("#semappend").empty();
	$("#semappend").append(allsemblock);
	
	//update the semester drop-down selectors
	Semesters.updateselectors();
	
	/*
	//load the offerings list
	$.getJSON("db/req.php?q=getofferingsems", function(data) {
		offeringSems = [];
		//unique semesters are returned
		for (var x = 0; x < data.length; ++x) {
			offeringSems.push(parseInt(data[x]["Semester"]));
		}
		
		//load the offered semesters into the dropdown in "all courses"
		for (var x = 0; x < offeringSems.length; ++x) {
			$("#search_semdropdown").append(
				$("<option>")
					.attr("value",offeringSems[x])
					.html(Semesters.fullstr(offeringSems[x]))
				);
		}
		
		//start the process of loading the currently selected offerings
		Offerings.semLimitChange();
	});
	*/
	
	//load the course list
	$.getJSON("db/req.php?q=getcourses", loadcourses);
	
	//make the head buttons rolloverable
	$(".headbtn").mouseover(function() {
		$(this).css({
			"background-color":"#777777"
		});
	});
	$(".headbtn").mouseout(function() {
		$(this).css({
			"background-color":"#555555"
		});
	});
	
	//update the print element
	var d = new Date();
	$("#curdate").html((d.getMonth() + 1) + "/" + 
						(d.getDate()) + "/" +
						d.getFullYear());
	
	//reset UI elements
	$("#search").attr("value","");
}

/**
Second function invoked in the loading process; called once course data is available
*/
function loadcourses(data) {
	courses = [];
	
	$("#courselist").empty();
	//create a draggable course box for each course
	//	and append it to the "all courses" area
	var clinner = $("<div>").attr("id", "clinner").appendTo("#courselist");
	for (var x = 0; x < data.length; ++x) {
		Store.loadCourse(data[x]);
	}
	
	//zomg slow.
	//Nifty("div.course","big");
	
	//begin loading the requirement rules
	$.getJSON("db/req.php?q=getrulescategories", function(data) {
		rulescategories = {};
		for (var x = 0; x < data.length; ++x) {
			//break the colors into integers
			data[x]["Color"] = $.map(data[x]["Color"].split(","), 
				function(n,i) {return parseInt(n, 10);});
			rulescategories[data[x]["Category"]] = data[x];
		}
		$.getJSON("db/req.php?q=getrules", loadrules);
	});
}

/*
Once the rule set has been loaded, recolor courses in the "all courses"
box according to their designation
*/
function recolorCourses() {
	$("#clinner").children().each(function(i, el) {
		var col = $(el).data("course").Color;
		$(el).css("background-color", col ? Utils.colorstr(col) : "#CCCCFF");
	});
}

/*
Load the rule set (bottom pane)
*/
function loadrules(data) {
	rules = data;
	
	$("#otherbar").empty();
	
	var rulecats = {};
	for (var x = 0; x < rules.length; ++x) {
		var cat = rules[x]["Category"];	
		//eval'ed code
		var klass = eval("[" + rules[x]["Code"] + "]")[0]();
		klass.cname = rules[x]["Name"];
		klass.catname = cat;
		klass.Color = rulescategories[klass.catname]["Color"];
		rulesobjs[klass.cname] = klass;
		
		if (!rulecats[cat]) {
			var color = rulescategories[cat]["Color"];
			var dkcolor = $.map(color, function(n) {return Math.floor(n * 0.6);})
			
			//place the credits rules in a separate div
			if (klass.catname == "Credits") {
				rulecats[cat] = $("<div>")
					.data("name", cat)
					/*.addClass("rulecat")*/
					.append(
						$("<div>")
							.addClass("rulecathead")
							.css({
								"font-weight":"bold",
								"text-align":"center",
								"font-variant":"small-caps"
							})
							.html(cat.replace(/\ /ig, "&nbsp;"))
					)
					.append(
						$("<div>")
							.attr("id","creditsrules")
							.css({
								"overflow-x":"visible",
								"overflow-y":"visible"
							})
					)
					.appendTo($("#creditsbox"));
			} else {
				rulecats[cat] = $("<div>")
					//the rule categories are indexed by name
					.data("name", cat)
					.data("showing",true)
					.addClass("rulecat")
					.css({
						"width":Rules.getRulesBoxWidth() + "px"
					})
					.append(
						//create the header for the course category box
						$("<div>")
							.addClass("rulecathead")
							.append(
								$("<img>")
									.attr({
										"src":"img/downarrow.gif",
										"align":"absmiddle"
									})
									.css({
										"padding-right":"3px"
									})
							)
							.append(
								$("<div>")
									.css({
										"display":"inline",
										"font-weight":"bold",
										"color":Utils.colorstr(dkcolor)
									})
									.html(cat.replace(/\ /ig, "&nbsp;"))
							)
							.mouseover(function() {
								$(this).css("color","#3333FF");
								//swap the show state of the arrow
								var subimg = $($(this).children("img")[0]);
								Rules.triimg(
									$(this).parent(),
									$(this).parent().data("showing"),
									true);
							})
							.mouseout(function() {
								$(this).css("color","black");
								Rules.triimg(
									$(this).parent(),
									$(this).parent().data("showing"),
									false);
							})
							.click(function() {
								Rules.showhide(
									$(this).parent(), 
									!$(this).parent().data("showing")
								);
								positionRules();
							})
					)
					.append(
						$("<div>")
							.addClass("rulebox")
							.css({
								"background-color":Utils.colorstr(dkcolor)	
							})
					)
					.append(
						//the collapsed representation
						$("<div>")
							.html(function() {
								var htm = "";
								var shortname = rulescategories[klass.catname]["ShortCategory"];
								for (var sdx = 0; sdx < shortname.length; ++sdx) {
									htm += shortname.charAt(sdx) + "<br>";
								}
								return htm;
							}())
							.css({
								"background-color":Utils.colorstr(dkcolor),
								"display":"none",
								"height":"100%",
								"padding-top":"5px",
								"text-align":"center",
								"font-weight":"bold",
								"line-height":"95%",
								"color":"#ffffff",
								"font-size":"140%"
							})
					)
					.appendTo($("#rulesarea"));
			}
		}
		
		//place the rule inside the rule area
		var kdvs = klass.getDivs();
		for (var y = 0; y < kdvs.length; ++y) {
			$(rulecats[cat].children()[1]).append(
				//place additional space in between the placed divs
				kdvs[y].css({
					"margin":"3px"
				})
			);
		}
	}
	
	Schedule.loadSchedule(loadfinish);
}

var Offerings = {
	data: {},
	semLimitChange: function() {
		var sem = parseInt($("#search_semdropdown").attr("value"), 10);
		//console.log(Offerings.hasSem(sem));
	},
	//check to see whether the data has been loaded for the given semester
	hasSem: function(idx) {
		return (Offerings.data[idx]) ? true : false;
	},
	//ensure that data is loaded for the given semester before continuing
	//	fn: callback function
	ensureSem: function(idx, fn) {
		if (Offerings.hasSem(idx)) {
			fn();
		} else {
			
		}
	}
}

function loadfinish() {
	//load the majors list
	$.getJSON("db/req.php?q=getmajors", function(data) {
		majors = data;
		
		var parent = $("#sem_majorchange");
		parent.empty();
		var cur = false;
		//insert the majors into the options box
		for (var x = 0; x < majors.length; ++x) {
			cur = (majors[x]["Code"] == Schedule.getMajor());
			$("<option>")
				.attr("value",x)
				.attr("selected", (cur) ? "selected" : "")
				.html(majors[x]["Code"])
				.appendTo(parent);
		}
		
		Schedule.updateMajorVisibility();
	});
	
	$("#container").css({"display":"inline"});
	$("#splash").css({"display":"none"});

	
	//perform a continuation of the login process
	Login.finishLogin();

	ContentPane.switchTo("longtermplan");
	
	Login.showLogin();
}