/**
@namespace Functionality for saving and restoring the state of the schedule
*/
var Store = {	
};

Store.existCourses = {};

/**
Load the course associated with the given 
*/
Store.loadCourse = function(/**Object*/ course) {
	var clinner = $("#clinner");
	var code = course["Code"];
	
	if (Store.existCourses[code]) {
		//the course already exists
		
		//the index of the existing course
		var idx = Store.existCourses[code];
		courses[idx] = course;
		
		//remove the course box for the previous course
		clinner.children().each(function(i, el) {
			var qel = $(el);
			
			//is the course code the same?
			var tcourse = qel.data("course");
			if (tcourse["Code"] == code) {
				qel.remove();
			}
		});
	} else {
		Store.existCourses[code] = courses.length;
		courses.push(course);
	}
	
	var div = Box.getCourseBox(course).css("margin","3px").appendTo(clinner);
	div.data("savestr", course["Code"]);
};

/**
@return a seralized version of the current schedule
*/
Store.serialize = function() {
	var sems = [];
	for (var x = 0; x < Ticks.NUMSEMS; ++x) {
		var cdv = [];
		Schedule.getCourseDivs(x).each(function(i) {
			cdv.push($(this).data("savestr"));
		});
		sems.push(cdv);
	}
	return sems;		
};

/**
@return a "print" representation of the current schedule
*/
Store.printserialize = function() {
	var sems = [];
	for (var x = 0; x < Ticks.NUMSEMS; ++x) {
		var cursem = [];
		var dvs = Schedule.getCourseDivs(x);
		
		for (var y = 0; y < dvs.length; ++y) {
			var qel = $(dvs[y]);
			var course = qel.data("course");
			var cdata = {};
			if (!course["Color"]) {
				cdata.color = [204, 204, 255];
			} else {
				cdata.color = course["Color"];
			}
			cdata.top = x;
			cdata.left = parseInt(qel.css("left")) / Ticks.credw;
			cdata.width = parseInt(qel.css("width")) / Ticks.credw;
			
			var subdivs = qel.children();

			//rather crude checking for course/metacourse
			if ($(subdivs[0]).hasClass("metactitle")) {
				cdata.ismeta = true;
				cdata.text = "<font size='8' align='center'>" + $(subdivs[0]).text() + "</font>"
			} else {
				cdata.ismeta = false;
				cdata.text = "<b>" + $(subdivs[0]).text() 
					+ "</b><br>" + 
					"<font size='10'>" + $(subdivs[1]).text() + "</font>";
			}
			cursem.push(cdata);
		}
		sems.push(cursem);
	}
	
	return sems;
}

/**
@return an array of strings with the completion states of the "Credits" rules
*/
Store.printcompletion = function() {
	var descs = [];
	$("#creditsrules").children().each(function(i, el) {
		var qel = $($(el).children()[0]);
		var txt = qel.text();
		var nums = txt.substring(0, txt.indexOf(" "));
		var n1 = parseInt(nums.substring(0, nums.indexOf("/")));
		var n2 = parseInt(nums.substring(nums.indexOf("/")+1));
		descs.push([n1, n2, txt]);
	});
	return descs;
};

/**
Load a serialized version into the schedule
@param obj an array with the list of serialized course/meta box representations
*/
Store.unserialize = function(/**Array*/ obj) {
	for (var x = 0; x < obj.length; ++x) {
		var semcred = 0;
		for (var y = 0; y < obj[x].length; ++y) {
			var savestr = obj[x][y];
			//split the save string into its components
			var splt = savestr.split("/");
			
			var box = null;
			switch (splt[0]) {
				case "Course":
					box = Box.getCourseBox(Schedule.getCourseFromCode(splt[1]));
					box.css({"top":"0px"});
					break;
				case "Rule":
					box = Box.getMetaBox(Rules.getRuleFromName(splt[1]), savestr);
					box.css({"top":"-15px"});
					break;
				default:
					error("Block save type must be 'Course' or 'Rule'");
					break;	
			}
			box.css({"position":"absolute"}).appendTo("#sem" + x);
			Tips.updateAlerts(box);

			/*
			var newcourse = Schedule.getCourseFromCode(obj[x][y]);
			var cb = Box.getCourseBox(newcourse)
				.css({
					"position":"absolute",
					"left":semcred*Ticks.credw,
					"top":"0"
				}).appendTo("#sem" + x);
			Tips.updateAlerts(cb);
			semcred += Schedule.getCredits(newcourse);
			*/
		}
		Schedule.repackDivs(x);
	}
	
	Store.setchanged(true);
};

/**
Has the current schedule been changed?
*/
Store.changed = false;

/*
Flag that the current schedule was changed, and enable the save button
@param bool true if the schedule has been changed, false otherwise.
*/
Store.setchanged = function(bool) {
	Store.changed = bool;
	$("#btn-savetext").html((bool) ? "Save" : "Saved");
}