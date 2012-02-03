/**
@namespace Used for showing tooltips associated with course and meta box elements
*/
var Tips = {
};

/**
Add alerts to the specified course box div that are shown in tooltips
Currently: add a warning if the course is not in the correct semester
@param dv the course or meta box to add alerts to
*/
Tips.updateAlerts = function(/**jquery*/ dv) {
	//Check to see if the course is in the correct semester
	//find the semester the course is in
	var semnum = parseInt(dv.parent().get(0).id.substring(3), 10);
	var semidx = Semesters.semesterAt(semnum);
	var course = dv.data("course");
	
	var alerts = [];
	
	if (!Tips.courseOffered(course["Offered"], semidx)) {
		alerts.push([Images.R_WARNING, "Course is offered in " + course["Offered"]]);
	}
	
	//remove all previous alerts
	dv.children(".alert").each(function(i, el) {
		el.parentNode.removeChild(el);
	});
	//insert new alerts
	var right = 3;
	for (var x = 0; x < alerts.length; ++x) {
		dv.append(
			$("<img>")
				.addClass("alert")
				.css("right", right + "px")
				.attr("src", Images.forCode(alerts[x][0]))
			);
		right += 18;
	}
	
	//save the alert data so that 
	dv.data("alerts", alerts);
}

/**
determine whether the course with "Offered" string given by rule 
will likely be offered in the semester given by semidx
@param rule "Fall, Spring", "Alt Fall", etc.
@param semidx the semester index used by the Semesters object
@return true if the index matches the rule, or if its status is unknown,
false if the index does not match the rule
*/
Tips.courseOffered = function(/**String*/ rule, /**int*/ semidx) {
	if (!rule) { return true; }
	
	//catch the exotic rules
	if (rule.toLowerCase().substring(0,5) == "every") {
		var split = rule.toLowerCase().split(" ");
		
		if (split.length >= 5) {
			//beginning _
			var starthalf = split[4];
			var startyear = parseInt(split[5], 10);
			var startsemidx = Semesters.idxForSem(starthalf, startyear);
		
			//for "every _ semester beginning _" rules
			if (split[2] == "semester") {
				var decim = parseInt(split[1], 10);
				return (semidx - startsemidx) % decim == 0;
			}
			
			//for "every _ years beginning _" rules
			if (split[2] == "years") {
				var decim = parseInt(split[1], 10);
				return (semidx - startsemidx) % (decim * 2) == 0;
			}
		}
	}
	
	switch (rule.toLowerCase()) {
		case "fall, spring":
			return true;
		case "fall":
			return (Semesters.fallspring(semidx) == "Fall");
		case "spring":
			return (Semesters.fallspring(semidx) == "Spring");
		case "alt spring (even years)":
			return (Semesters.fallspring(semidx) == "Spring") &&
					(Semesters.year(semidx) % 2 == 0);
		case "alt spring (odd years)":
			return (Semesters.fallspring(semidx) == "Spring") &&
					(Semesters.year(semidx) % 2 == 1);
		case "alt fall (even years)":
			return (Semesters.fallspring(semidx) == "Fall") &&
					(Semesters.year(semidx) % 2 == 0);
		case "alt fall (odd years)":
			return (Semesters.fallspring(semidx) == "Fall") &&
					(Semesters.year(semidx) % 2 == 1);		
		default:
			return true;
	}
}

/**
Show a tooltip with the given content by the specified element
@param byelm the element to display the tooltip next to
@param content a jquery node containing the content to display.
@param width: the width of the element to show.
*/
Tips.show = function(/**jquery*/ byelm, /**jquery*/ content, /**int*/ width) {
		var tel = $("#tipel");
		//the tip display element hasn't been created yet
		if (tel.length == 0) {
			tel = $("<div>")
				.attr("id","tipel")
				.css("z-index","1000")
				.appendTo(document.body);
		}
		
		var loc = byelm.offset(); loc = [loc.left, loc.top];
		var size = [byelm.outerWidth(), byelm.outerHeight()];
		var wsize = [$(window).width(), $(window).height()];
		
		tel.css("width", width);
		
		//check for left/rightness
		if (loc[0] + size[0] + width < wsize[0]) {
			//place on the right
			tel.css("left",loc[0] + size[0]);
		} else {
			tel.css("left",loc[0] - width);
		}
		
		//by default, orient down unless we're close to bottom.
		if (loc[1] < wsize[1] * 0.7) {
			tel.css("bottom","");
			tel.css("top",loc[1]);
		} else {
			tel.css("bottom",wsize[1]-loc[1]-size[1]);
			tel.css("top","");
		}
		
		//insert the tooltip content
		tel.empty();
		tel.append(content);
		
		//show the tooltip
		tel.css("display","block");
	};
	
/**
Hide the last-shown tooltip
*/
Tips.hide = function() {
	var tel = $("#tipel");
	if (tel.length == 0) { return; }
	
	tel.css("display","none");
};