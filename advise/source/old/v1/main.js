var NUMSEMS = 8;
var MAXCREDITS = 24;
var credw = (480+240)/MAXCREDITS;
var SEMHEIGHT = 50; //semester height in pixels
var courses = null;
var rules = null;
var majors = null;

var changed = false;
var user = {};	//logged-in user information
/*
Findables:
HACK
TODO

Element prefixes:
sem#: main semester block
sdesc#: semester description block
sem-#-#: semester tick box
cb#: course in box
cd#: course dropped on schedule
rul#: a rule
*/
		
//debugging in IE is a pain.
an = 0;
function alertn(obj) {
	if (an < 5) {
		alert(obj);
	}
	++an;
}

//enable or disable the login buttons
function enableLogin(bool) {
	var tstr = (bool) ? "" : "disabled";
	$("#dologin").attr("disabled",tstr);
	$("#username").attr("disabled",tstr);
	$("#password").attr("disabled",tstr);	
}

//temporary; for testing purposes
function skiplogin() {
	$("#username").attr("value","");
	$("#password").attr("value","");
	processlogin();
}

$(document).ready(function(){
	enableLogin(true);
	//skiplogin();
});

function processlogin() {
	$("#loginicon").attr("src","img/progress.gif");
	$("#loginheadtext").html("Please wait...");
	
	$.post("db/req.php?q=login", 
		{
			"username":$("#username").attr("value"),
			"password":$("#password").attr("value")
		},
		function(data) {
			//check to see if login was successful
			if (data.length > 0) {
				user = data[0];
				user["Semesters"] = eval("(" + user["Semesters"] + ")")
				$(".usertext").each(function() {
					$(this).html(user["Name"]);
				});
				enableLogin(false);
				doload();
			} else {
				$("#loginicon").attr("src","img/exclamation.png");
				$("#loginheadtext").html("Invalid credentials");
				$("#password").attr("value","");
				$("#username").select();
			}
		}, "json");
}

function doload() {
	//build the semester objects
	var allsemblock = $("<div>").addClass("allSemBlock");
	for (var x = 0; x < NUMSEMS; ++x) {
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
		for (var y = 0; y < MAXCREDITS; ++y) {
			semblock.append(
				$("<div>")
					.addClass("semtick")
					.css(origTickStyle(x,y)[1])
					.attr("id","sem-" + x + "-" + y)
			);
		}
		allsemblock.append(sem);
	}

	$("#semappend").append(allsemblock);
	
	//update the semester selectors
	Semesters.updateselectors();
	
	//load the majors list
	$.getJSON("db/req.php?q=getmajors", function(data) {
		majors = data;
		
		var parent = $("#majorselect");
		var cur = false;
		//insert the majors into the options box
		for (var x = 0; x < majors.length; ++x) {
			cur = (majors[x]["Code"] == user["Major"]);
			$("<option>")
				.attr("value",x)
				.attr("selected", (cur) ? "selected" : "")
				.html(majors[x]["Code"])
				.appendTo(parent);
		}
		Options.updatemajordesc();
	});
	
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

var Options = {
	//update the UI with new major selection information
	updatemajordesc: function() {
		var major = majors[parseInt($("#majorselect").attr("value"))];
		$("#majordesc").html(major["Name"]);
		$("#savemajor").attr("disabled", (major["Code"] == user["Major"]) ? "disabled" : "");
	},
	//save the current major selection
	savemajor: function() {
		var major = majors[parseInt($("#majorselect").attr("value"))];

		$.post("db/req.php?q=setmajor", 
		{
			"major":major["Code"]
		},
		function(data) {
			//this reference isn't a problem - the button is disabled
			user["Major"] = major["Code"];
			Options.updatemajordesc();
			updateMajorRules();	
		}, "text");
	}
}

function setchanged(bool) {
	changed = bool;
	$("#savetext").html((bool) ? "Save" : "Saved");
}

function loadcourses(data) {
	courses = data;
	var ba = [];
	
	var clinner = $("<div>").attr("id", "clinner").appendTo("#courselist");
	for (var x = 0; x < data.length; ++x) {
		var di = data[x];
		getCourseBox("cb" + x, di).css("margin","5px").appendTo(clinner);
	}	
	
	//zomg slow.
	//Nifty("div.course","big");
	
	$.getJSON("db/req.php?q=getrules", loadrules);
}

//display only those rules that are specified by the user's major
function updateMajorRules() {
	$(".rulecategory").each(function(i) {
		var el = $(this);
		var category = el.data("category");
		//check if the rule category is major-specific
		for (var x = 0; x < majors.length; ++x) {
			if (majors[x]["Code"] == category) {
				//hide non-user majors
				el.css("display", (category == user["Major"]) ? "block" : "none");
			}
		}
	});
}

function loadrules(data) {
	rules = data;
	
	var gdivs = {};
	//create the rules
	for (var x = 0; x < rules.length; ++x) {
		//We have to array-ize before pulling the function out.
		var rulobj = eval("[" + rules[x]["Code"] + "]")[0]();
		var rule = $("<div>")
			.attr("id", "rul" + x)
			.attr("className", "rule")
			.data("rule", rulobj)
			.data("searcher", rules[x]["Searcher"])
			.click(function() {
				$("#search").attr("value", $(this).data("searcher"));
				dosearch();
			})
			.mouseover(function() {
				$(this).addClass("ruleover");
			})
			.mouseout(function() {
				$(this).removeClass("ruleover");		
			});
		var category = rules[x]["Category"];
		
		//should this category show?
		var showing = true;
		if (!gdivs[category]) {
			gdivs[category] = 
				$("<div>").attr("className","rulecategory")
				.data("showing", showing)
				.data("category", category)
				.append(
					$("<div>").attr("className","rulecategoryhead")
						.append(
							$("<img>")
								.css("padding-left","2px")
								.attr("src","img/help.png")
								.attr("align","absmiddle")
						)
						.append(
							$("<img>")
								.css("padding-right","2px")
								.attr("src",
									(showing) ? "img/downarrow.gif" : "img/rightarrow.gif")
								.attr("align","absmiddle")
						)
						.append(
							$("<div>").css("display","inline").html(category)
						)
						.mouseover(function() {
							$(this).css("color","#FFFFFF");
						})
						.mouseout(function() {
							$(this).css("color","#000000");
						})
						.click(function() {
							var child = $(this.parentNode).children().slice(1,2);
							var showing = $(this).data("showing");
							$(this).data("showing", !showing);
							child.css("display", (showing) ? "block" : "none");
							$(this).children().slice(1,2).attr("src",
								(showing) ? "img/downarrow.gif" : "img/rightarrow.gif"
							);
						})
				).append(
						$("<div>")
				);
		}
		gdivs[category].children().slice(1,2).append(rule);
		
		//attach an update list to the specified courses.
		for (var c = 0; c < courses.length; ++c) {
			var course = courses[c];
			if (rulobj.when(courses[c])) {
				if (!course.updaters) {
					course.updaters = [];
				}
				//updaters are indexed by element id
				course.updaters.push(x);
			}
		}
	}
	
	//load in the rule blocks
	var msgs = $("#messages");
	for (var d in gdivs) {
		gdivs[d].appendTo(msgs);
	}
	
	updateMajorRules();
	
	//if the user has a saved schedule, load it
	$.getJSON("db/req.php?q=load", function(data) {
		var dt = data[0];
		unserialize(eval("(" + dt["Data"] + ")"));
		updateAllRules();
		setchanged(false);
		loadfinish();
	});
}

function loadfinish() {
	$("#container").css({"display":"inline"});
	$("#splash").css({"display":"none"});

	resizefun();
}

//we have to hack together a few resize fixes
$(window).resize(resizefun = function() {
	var height = $(window).height();
	var width = $(window).width();
	
	$("#courselist").css({
		"height":(height-50)+"px"
	})
	var fudge = SEMHEIGHT + 20;
	$("#messages").css({
		"height": (height - $("#semesters").height() - $("#header").height() - fudge) + "px"
	})
});

var R_COMPLETE = 1;
var R_WARNING = 2;
var R_UNKNOWN = 3;
var R_ERROR = 4;

function imageForRCode(rcode) {
	switch (rcode) {
	case R_COMPLETE: //complete
		imgsrc = "img/accept.png"; break;
	case R_WARNING: //warning
		imgsrc = "img/error.png"; break;
	case R_UNKNOWN: //unknown
		imgsrc = "img/help.png"; break;
	case R_ERROR: //error
		imgsrc = "img/exclamation.png"; break;
	}
	return imgsrc;
}

//Update the rule with the given index
function updateRule(elm) {
	var status = elm.data("rule").status();
	elm.html("");
	//store the current status for the group update
	elm.data("status", status[0]);
	
	$("<img>")
		.attr("className","statusimg")
		.attr("src",imageForRCode(status[0]))
		.attr("align","absmiddle")
		.appendTo(elm);
	status[1].appendTo(elm);
}

//update the given group. Only call after all rules in the group have been updated.
function updateGroup(elm) {
	var status = 1; //assume completion
	elm.children().each(function() {
		var st = $(this).data("status");
		if (st) {
			status = Math.max(status, st);
		}
	});
	elm.parent().children().slice(0,1).children().slice(0,1)
		.attr("src",imageForRCode(status));
}

function updateAllRules() {
	for (var x = 0; x < rules.length; ++x) {
		updateRule($("#rul" + x));
	}
	$(".rulecategory").each(function() {
		updateGroup($(this).children().slice(1,2));
	});
}

//get a course box with the given id
function getCourseBox(id, course) {
	var ncred = getCredits(course);
	return $("<div>")
		.data("numcredits",ncred)
		.css("width", (credw*ncred) + "px")
		.attr("id", id)
		.attr("className", "course")
		.append(
			$("<div>").attr("className", "coursecode").text(course["Code"])
		)
		.append(
			$("<div>").attr("className", "coursetitle").text(course["Title"])
		)
		.draggable({
			appendTo: document.body,
			helper: "clone",
			/* zIndex: 500, */
			opacity: 0.5,
			cursor: "move",
			start: function(e, ui) {
				var src = srcFromDrag(e);
				var totalcred = $(src).data("numcredits");
				
				//highlight the accepting blocks
				for (var x = 0; x < NUMSEMS; ++x) {
					var semcred = getSemesterCredits(x);
					if (semcred + totalcred <= MAXCREDITS) {
						highlightTicks(x, semcred, semcred + totalcred);
					}
				}
				
				this.lowercorner = $("#sem-0-0").offset();
				this.lowercorner = [this.lowercorner.left, this.lowercorner.top];
				this.parentsem = src.parentNode;
			},
			drag: function(e, ui) {
				//console.log(e.clientX, e.clientY);
			},
			stop: function(e, ui) {
				var src = srcFromDrag(e);
				if (src == null) { return; }
				var totalcred = getCredits(getCourse(src.id));
				var idx = parseInt(src.id.substring(2));
				var newid = "cd" + idx;
				var newcourse = getCourse(newid);
				
				for (var x = 0; x < NUMSEMS; ++x) {
					var semcred = getSemesterCredits(x);
					delightTicks(x, Math.max(0, semcred - totalcred - 1), 
									Math.min(MAXCREDITS, semcred + totalcred + 1));
				}
				
				var semmatch = 1000;
				//check to see if we're within a semester
				var coords = [e.clientX, e.clientY];
				//check x dimension
				if (coords[0] > this.lowercorner[0] && coords[0] < this.lowercorner[0] + MAXCREDITS*credw) {
					semmatch = Math.floor(((coords[1] - this.lowercorner[1]) / (SEMHEIGHT + 2)));
				}

				//successful drop
				if (semmatch < NUMSEMS) {
					//if same semester, don't allow a drop.
					if (parseInt(src.parentNode.id.substring(3)) == semmatch) {
						return;
					}
					
					//to break out of outer function
					var contin = true;
					//if the same course already exists, don't allow a drop.
					getCourseDivs(semmatch).each(function(i) {
						if (this.id.substring(2) == src.id.substring(2)) {
							contin = false;
						}
					});
					if (!contin) {
						return;
					}

					var semcred = getSemesterCredits(semmatch);

					getCourseBox(newid, newcourse)
					.css({
						"position":"absolute",
						"left":semcred*credw,
						"top":"0"
						/*"z-index":500*/
					}).appendTo("#sem" + semmatch);
				} 
				
				//remove the old course it was already on the schedule.
				//also clean up after jquery before jquery does.
				src.parentNode.removeChild(src);
				if (src.id.substring(0,2) == "cd") {
					var pid = this.parentsem.id;
					var subel = $("#" + pid + ">#" + src.id).get();
					for (var y = 0; y < subel.length; ++y) {
						subel[y].parentNode.removeChild(subel[y]);
					}
					
					var n = 0;
					getCourseDivs(pid.substring(3)).each(function(i) {
						$(this).css("left",n*credw);
						n += $(this).data("numcredits");
					});
				}
				
				//check to see if rule updaters need to be run
				if (newcourse.updaters) {
					for (var x = 0; x < newcourse.updaters.length; ++x) {
						var rdiv = $("#rul" + newcourse.updaters[x]);
						updateRule(rdiv);
						updateGroup(rdiv.parent());
					}
				}
				
				setchanged(true);
			}
		});
}

//get the source div from this drag event
function srcFromDrag(e) {
	var src = e.originalTarget;
	if (!src) {
		src = e.srcElement;
	}
	while (src && (!src.id || (src.id == ""))) {
		src = src.parentNode;
	}
	return src;
}

//get the given semester tick
function st(sem, tick) {
	return $("#sem-" + sem + "-" + tick);
}

//return a [string, dict] format original tick style
function origTickStyle(sem, tick) {
	var tstyle = "left: " + (credw*tick) + "px; width: " + credw + "px;";
	tdict = {left: (credw*tick) + "px", width: credw + "px"};
	if ((tick % 4) == 0) {
		tstyle += " border-left: 2px solid #909090; ";
		tdict["borderLeft"] = "2px solid #909090";
	}
	//else if ((tick % 2) == 0) {
	//	tstyle += " border-left: 1px dotted #909090";
	//}
	else {
		tstyle += " border-left: 1px dotted #909090; ";
		tdict["borderLeft"] = "1px dotted #909090";
	}
	tstyle += " border-right: none;"
	tdict["borderRight"] = "none";
	tdict["borderTop"] = "none";
	tdict["borderBottom"] = "none";
	tdict["margin"] = "0px";
	return [tstyle, tdict];
}

//highlight the given semester credit ticks
function highlightTicks(sem, start, end) {
	st(sem, start).css({
		borderLeft: "2px solid #01009A"
	});
	st(sem, end - 1).css({
		borderRight: "2px solid #01009A"
	});
	st(sem, end).css({
		marginLeft: "2px"
	});
	for (var x = start; x < end; ++x) {
		st(sem,x).css({
			borderTop: "2px solid #01009A",
			borderBottom: "2px solid #01009A",
			margin: "-1px"
		});
	}
}

//unhlighlight the given semester credit ticks
function delightTicks(sem, start, end) {
	for (var x = start; x < end; ++x) {
		st(sem,x).css(origTickStyle(sem, x)[1]);
	}
}

//return an array of the total credits for a single block
function getSingleCredits(str) {
	var spdx = str.indexOf(" ");
	return [parseInt(str.substring(0, spdx)), str.substring(spdx+1)]; 
}
//get the array representing all credits associated with a course
function getAllCredits(str) {
	var pdx = str.indexOf("+");
	if (pdx > 0) {
		return [getSingleCredits(str.substring(0, pdx - 1)),
				getSingleCredits(str.substring(pdx + 2))];
	} else {
		return [getSingleCredits(str)];			
	}
}
//find the total number of credits period
function getAllCreditsCount(obj) {
	var n = 0;
	for (var x = 0; x < obj.length; ++x) {
		n += obj[x][0];
	}
	if (n != n) { //HACK for pathological cases
		n = 4;
	}
	return n;
}
//abbreviation for getAllCreditsCount(getAllCredits(course["Credits"]))
function getCredits(course) {
	return getAllCreditsCount(getAllCredits(course["Credits"]));
}

//get the course associated with this id
function getCourse(id) {
	return courses[id.substring(2)];
}

//get the course by code.
//return [id, courseobject]
function getCourseFromCode(code) {
	for (var x = 0; x < courses.length; ++x) {
		if (courses[x]["Code"] == code) {
			return [x, courses[x]];
		}
	}
}

//get the total number of credits placed so far for a given semester
function getSemesterCredits(num) {
	var n = 0;
	var ids = {};
	getCourseDivs(num).each(function(i) {
		if (!ids[this.id]) {
			n += $(this).data("numcredits");
		}
		ids[this.id] = true;
	});
	return n;
}

//return the courses associated with the semester given by the number sem
function getCourseDivs(sem) {
	return $("#sem" + sem).children(":not(.semtick)");
}

var searching;
function dosearch() {
	if (!searching) {
		$("#searchimg").attr("src","img/progress.gif");
		setTimeout(updatesearch, 300);
	}
	searching = true;
}
function updatesearch() {
	//split by a comma delimiter in the search
	var texts = $("#search").attr("value").split(",");
	$("#clinner").children().each(function(i) {
		var course = getCourse(this.id);
		var strings = [course["Code"], course["Title"], course["Instructors"]];
		//categories in the UI
		var cats = [true, $("#search_title").attr("checked"), $("#search_faculty").attr("checked")];
		
		//match to courses
		var match = false;
		for (var x = 0; x < strings.length; ++x) {
			if (cats[x]) {
				for (var y = 0; y < texts.length; ++y) {
					if (strings[x].toLowerCase().indexOf(texts[y].toLowerCase()) > -1) {
						match = true;
					}
				}
			}
		}
		
		$(this).css("display", (match || texts == [""]) ? "inline" : "none")
	});
	searching = false;
	$("#searchimg").attr("src","img/find.png");
}

//Ruleset assistance

//return true if the semester given by sem has the course given by code str
function semesterHasCourse(sem, str) {
	var match = false;
	getCourseDivs(sem).each(function(i) {
		if (getCourse(this.id)["Code"] == str) {
			match = true;
		}
	});
	return match;
}

//return true if the schedule has the given course placed on it
function scheduleHasCourse(str) {
	for (var x = 0; x < NUMSEMS; ++x) {
		if (semesterHasCourse(x, str)) {
			return true;
		}	
	}
	return false;
}

//find all courses on the schedule
function getAllCourses() {
	var courses = [];
	for (var x = 0; x < NUMSEMS; ++x) {
		getCourseDivs(x).each(function (i) {
			courses.push(getCourse(this.id));
		});	
	}
	return courses;
}

//semesters are indexed starting from 0 as Fall 2000
var Semesters = {
	INFUTURE: 4, //the number of semester options to show in the future
	fallspring: function(idx) {
		return (idx % 2 == 0) ? "Fall" : "Spring";
	},
	year: function(idx) {
		return 2000 + Semesters.yearshort(idx);
	},
	yearshort: function(idx) {
		var n = Math.floor(idx / 2);
		if (n < 10) {
			return "'0" + n;
		} else {
			return "'" + n;
		}
	},
	fullstr: function(idx) {
		return Semesters.fallspring(idx) + " " + Semesters.yearshort(idx);
	},
	updateselectors: function() {
		for (var x = 0; x < NUMSEMS; ++x) {
			Semesters.updateselector(x);
		}
	},
	updateselector: function(idx) { //update one semester selector
		//find the correct span to place in the options boxen
		var low = 0;
		var high = 0;
		if (idx == 0) {
			low = user["Semesters"][idx];
			high = user["Semesters"][idx] + Semesters.INFUTURE;
		} else {
			low = user["Semesters"][idx-1]+1;
			high = user["Semesters"][idx] + Semesters.INFUTURE;
		}
		
		var el = $("#sdesc" + idx).html("");
		for (var x = low; x <= high; ++x) {
			el.append(
				$("<option>")
					.attr("value",x)
					.attr("selected", (x == user["Semesters"][idx]) ? "selected" : "")
					.html(Semesters.fullstr(x))
			);
		}
		
		//HACK: IE makes the boxes explode if we don't reinsert them
		//	after repopulation.
		var elin = el.get(0);
		var pn = elin.parentNode;
		pn.removeChild(elin);
		pn.appendChild(elin);
	},
	eventchange: function() { //triggered by a dropdown select
		var idx = parseInt(this.id.substring(5));
		var val = parseInt($(this).attr("value"));
		for (var x = idx; x < NUMSEMS; ++x) {
			user["Semesters"][x] = x + (val-idx);
			Semesters.updateselector(x);
		}
		
		//save the update
		$.post("db/req.php?q=setsemesters", 
		{
			"semesters":JSON.stringify(user["Semesters"])
		},
		function(data) { }, "text");
	}
}

function button_connect() {
	
}

function button_options() {
	tb_show("Options","#TB_inline?height=300&width=300&inlineId=popoptions",null);
}

//for buttons on the main page
function button_print() {
	window.print();
}

function button_save() {
	$.post("db/req.php?q=save", {"data":JSON.stringify(serialize())},
		function(data) {
			
		}, "text");

	setchanged(false);
}

//return a serialized version of the schedule
function serialize() {
	var sems = [];
	for (var x = 0; x < NUMSEMS; ++x) {
		var cdv = [];
		getCourseDivs(x).each(function(i) {
			cdv.push(getCourse(this.id)["Code"]);
		});
		sems.push(cdv);
	}
	return sems;
}

//remove all courses from the semesters
//	it is highly recommended to update all rules after this call.
function removeall() {
	for (var x = 0; x < NUMSEMS; ++x) {
		getCourseDivs(x).each(function() {
			this.parentNode.removeChild(this);
		});
	}
	
	setchanged(true);
}

//load a serialized version into the schedule
function unserialize(obj) {
	for (var x = 0; x < obj.length; ++x) {
		var semcred = 0;
		for (var y = 0; y < obj[x].length; ++y) {
			var nc = getCourseFromCode(obj[x][y]);
			newid = "cd" + nc[0];
			newcourse = nc[1];
			getCourseBox(newid, newcourse)
				.css({
					"position":"absolute",
					"left":semcred*credw,
					"top":"0"
					/* "z-index":500 */
				}).appendTo("#sem" + x);
			semcred += getCredits(newcourse);
		}
	}
	
	setchanged(true);
}

//classes for rule requirements
var Rules = {};

//rules status:
//	1: complete
//	2: warning
//	4: error
//status() should return [statuscode, content]
//when should return true for any course that will trigger an update

Rules.SingleCourse = function(code) {
	this.code = code;
	this.course = getCourseFromCode(code)[1];
}
Rules.SingleCourse.prototype.status = function() {
	var explstr = "<b>" + this.code + "</b> " + this.course["Title"];
	//HACK: IE can't create spans?
	var cont = $("<div>").css({"display":"inline"});
	if (scheduleHasCourse(this.code)) {
		return [R_COMPLETE, cont.html("Course scheduled: " + explstr)];		
	} else {
		return [R_ERROR, cont.html("Please schedule: " + explstr)];
	}
}
Rules.SingleCourse.prototype.when = function(course) {
	return (course["Code"] == this.code);
}

//When N of the specified courses are required.
Rules.NOf = function(num, codes) {
	this.num = num;
	this.numexpls = ["","one","two","three","four","five","six"];
	this.numtext = this.numexpls[num];
	this.codes = codes;
	this.courses = [];
	for (var x = 0; x < codes.length; ++x) {
		this.courses.push(getCourseFromCode(codes[x])[1]);
	}
}
Rules.NOf.prototype.status = function() {
	var cont = $("<div>").css({"display":"inline"});
	var notokaystr = "";
	var okaystr = "";
	var sched = 0;
	for (var x = 0; x < this.codes.length; ++x) {
		notokaystr += "<div style='padding-left: 20px'><b>" + 
			this.codes[x] + "</b> " + this.courses[x]["Title"] + "</div>";
		if (scheduleHasCourse(this.codes[x])) {
			++sched;
			okaystr += "<div style='padding-left: 20px'><b>" + 
						this.codes[x] + "</b> " + this.courses[x]["Title"] + "</div>";
		}
	}
	var str = "";
	if (sched > 0) {
		str += this.numexpls[sched].substring(0,1).toUpperCase() 
			+ this.numexpls[sched].substring(1) + 
			" scheduled: " + okaystr;
	}
	if (sched < this.num) {
		str += 	"Please schedule " + this.numtext + " of: <br>" + notokaystr;
	}
	cont.html(str);
	return [(sched >= this.num) ? R_COMPLETE : R_ERROR, cont];
}
Rules.NOf.prototype.when = function(course) {;
	for (var x = 0; x < this.codes.length; ++x) {
		if (this.codes[x] == course["Code"]) {
			return true;
		}
	}
	return false;
}



Rules.Unknown = function(str) {
	this.str = str;
}
Rules.Unknown.prototype.status = function() {
	return [R_UNKNOWN, $("<div>").css({"display":"inline"}).html(this.str)];
}
Rules.Unknown.prototype.when = function(course) {
	return false;
}

//for the credits requirements. 
//	str is the description string to display
//	types is the coloring to accept. An empty array for all types.
//	num is the number of credits required
Rules.Credits = function(str, types, num) {
	this.str = str;
	this.types = types;
	this.num = num;
}
Rules.Credits.prototype.match = function(course) {
	if (this.types.length == 0) {
		return getCredits(course);
	}
	var nc = 0;
	var cred = getAllCredits(course["Credits"]);
	for (var x = 0; x < cred.length; ++x) {
		for (var y = 0; y < this.types.length; ++y) {
			if (cred[x][1] == this.types[y]) {
				nc += cred[x][0];
			}
		}
	}
	return nc;
}
Rules.Credits.prototype.status = function() {
	var courses = getAllCourses();
	var cur = 0;
	for (var x = 0; x < courses.length; ++x) {
		cur += this.match(courses[x]);
	}
	
	//HACK: we apparently can't set width on relatively positioned inline divs
	var sp_complete = "";
	var sp_incomplete = "";
	var curs = Math.min(cur, this.num);
	for (var x = 0; x < (curs)/4; ++x) {sp_complete += "&nbsp;";}
	for (var x = 0; x < (this.num - curs)/4; ++x) {sp_incomplete += "&nbsp;";}
	
	var cont = $("<div>").css({"display":"inline"})
		.append(
			$("<div>")
				.css({
					"display":"inline",
					"border":"1px solid white",
					"background-color":"#666666"
				})
				.append(
					$("<div>").css({
						"display":"inline",
						"background-color":"#CCCCFF"
					}).html(sp_complete)
				)
				.append(
					$("<div>").css({
						"display":"inline"
					}).html(sp_incomplete)
				)
		)
		.append(
			$("<div>")
				.css({
					"display":"inline",
					"margin-left":"5px"
				})
				.html(cur + "/" + this.str)
				);
	
	return [(cur >= this.num) ? R_COMPLETE : R_ERROR, cont];
}
Rules.Credits.prototype.when = function(course) {
	return (this.match(course) > 0);
}