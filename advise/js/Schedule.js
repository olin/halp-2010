/**
@namespace Used for managing courses and course boxes on the schedule
*/
var Schedule = {	
};

/**
Set the user's major to the given major
@param the abbreviation for the schedule's major (ECE, ME, ...)
*/
Schedule.setMajor = function(/**String*/ str) {
	Schedule.major = str;
	if (majors) {
		Schedule.updateMajorVisibility();
	}
};

/**
Update the visible state of the major boxes according to the schedule's major
*/
Schedule.updateMajorVisibility = function() {
	var majorcodes = [];
	for (var x = 0; x < majors.length; ++x) {
		majorcodes.push(majors[x]["Code"])
	}
	
	$(".rulecat").each(function(i, el) {
		//check to see if the rule category is a major
		var name = $(el).data("name");
		if ($.inArray(name, majorcodes) > -1) {
			//if it's not a match with the current major, hide it
			$(el).css("display",
				(Schedule.getMajor() == name) ? "block" : "none"	
			);
		}
	});
	
	//update the major dropdown
	$("#sem_majorchange").children().each(function(i, el) {
		var qel = $(el);
		if (Schedule.getMajor() == qel.text()) {
			qel.attr("selected", "selected");
		} else {
			qel.removeAttr("selected");
		}
	});
	
	positionRules();
};

/**
Load the schedule for the currently-logged-in user
@param continuation a continuation function to call when the load is complete
*/
Schedule.loadSchedule = function(/**Function*/ continuation) {
	Schedule.removeall();
	
	//if the user has a saved schedule, load it
	$.getJSON("db/req.php?q=load", function(data) {
		var dt = data[0];
		
		//see button_save
		if (!currentlySaving) {
			Store.unserialize(eval("(" + dt["Data"] + ")"));
			Schedule.setMajor(dt["Major"]);
		} else {
			Store.unserialize(currentlySaving)
		}
		
		if (majors) {
			Schedule.updateMajorVisibility();
		}
		
		Rules.updateAllRules();
		recolorCourses();
		Store.setchanged(false);
		
		continuation();
	});	
};

/**
@return the schedule's major (ECE, ME, ...)
*/
Schedule.getMajor = function() {
	return Schedule.major;
}

/**
If the semester given by sem has the course given by code str, we have a "match"
@param sem the semester to search in
@param str the course code to search for
@return the number of matches
*/
Schedule.semesterHasCourse = function(/**int*/ sem, /**String*/ str) {
	var matches = 0;
	Schedule.getCourseDivs(sem).each(function(i) {
		if ($(this).data("course")["Code"] == str) {
			matches++;
		}
	});
	return matches;
};

//TODO: cache this!

/**
Return the number of matches of a course on the schedule
@param str the course code to search for
@return the number of matches
*/
Schedule.scheduleHasCourse = function(/**String*/ str) {
	var matches = 0;
	for (var x = 0; x < Ticks.NUMSEMS; ++x) {
		matches += Schedule.semesterHasCourse(x, str);
	}
	return matches;
};

/**
Return the number of credits in the given semester
@param str the course code to search for
@return the number of matches
*/
Schedule.semesterCourseCredits = function(/**int*/ sem, /**String*/ str) {
	var cr = 0;
	Schedule.getCourseDivs(sem).each(function(i) {
		if ($(this).data("course")["Code"] == str) {
			cr += $(this).data("numcredits");
		}
	});
	return cr;
};

//TODO: cache this!

/**
return the number of credits on the schedule for the given course code
@param str the course code
*/
Schedule.scheduleCourseCredits = function(/**String*/ str) {
	var cr = 0;
	for (var x = 0; x < Ticks.NUMSEMS; ++x) {
		cr += Schedule.semesterCourseCredits(x, str);
	}
	return cr;
};

/**
Return the course codes of all courses on the schedule
@return an array of all course codes
*/
Schedule.getAllCourses = function() {
	var courses = [];
	for (var x = 0; x < Ticks.NUMSEMS; ++x) {
		Schedule.getCourseDivs(x).each(function (i) {
			courses.push($(this).data("course"));
		});
	}
	return courses;
};

/**
Find the course located at the given [semester, credit] location
@param loc the [semester, credit] tuple of the course location on the schedule
@return the div corresponding to the location, or false if none found.
*/
Schedule.courseFromLoc = function(/**Array*/ loc) {
	var semcds = Schedule.getCourseDivs(loc[0]);
	var low = 0;
	for (var x = 0; x < semcds.length; ++x) {
		low += semcds[x].data("numcredits");
	}
};

/**
Remove all courses from the schedule. 
It is highly recommended to update all rules after this call.
*/
Schedule.removeall = function() {
	for (var x = 0; x < Ticks.NUMSEMS; ++x) {
		Schedule.getCourseDivs(x).each(function() {
			this.parentNode.removeChild(this);
		});
	}
	
	Store.setchanged(true);
};

/**
@param str the string to parse credits from
@return an array of the total credits for a single block
*/
Schedule.getSingleCredits = function(/**String*/ str) {
	var spdx = str.indexOf(" ");
	return [parseInt(str.substring(0, spdx), 10), str.substring(spdx+1)]; 
};

/**
@return an array representing all credits associated with a course
*/
Schedule.getAllCredits = function(str) {
	var pdx = str.indexOf("+");
	if (pdx > 0) {
		return [Schedule.getSingleCredits(str.substring(0, pdx - 1)),
				Schedule.getSingleCredits(str.substring(pdx + 2))];
	} else {
		return [Schedule.getSingleCredits(str)];			
	}
};

/**
@param obj the course credits object, as returned from Schedule.getAllCredits
@return the total number of credits for a parsed course credits object
*/
Schedule.getAllCreditsCount = function(obj) {
	var n = 0;
	for (var x = 0; x < obj.length; ++x) {
		n += obj[x][0];
	}
	if (n != (n)) { //HACK for pathological cases, make lint happy.
		n = 4;
	}
	return n;
};

/**
Abbreviation for getAllCreditsCount(getAllCredits(course["Credits"]))
@param course the string from the catalog to parse
*/
Schedule.getCredits = function(/**String*/ course) {
	return Schedule.getAllCreditsCount(Schedule.getAllCredits(course["Credits"]));
};

/**
get the course by code.
@return courseobject for the given code, or false if none was found.
*/
Schedule.getCourseFromCode = function(/**String*/ code) {
	for (var x = 0; x < courses.length; ++x) {
		if (courses[x]["Code"] == code) {
			return courses[x];
		}
	}
	
	return false;
};

/**
@param num a semester index
@return the total number of credits placed so far for the semester
*/
Schedule.getSemesterCredits = function(/**int*/ num) {
	var n = 0;
	Schedule.getCourseDivs(num).each(function(i) {
		n += $(this).data("hascourse") ? 0 : $(this).data("numcredits");
	});
	return n;
};

/**
@return the courses associated with the semester given by the number sem
@param sem the semester index to retrieve courses from
*/
Schedule.getCourseDivs = function(sem) {
	return $("#sem" + sem).children(":not(.semtick)");
};

/**
repack all course items in a semester after a resize/insert/delete
@param sem the semester index to repack
*/
Schedule.repackDivs = function(/**int*/ sem) {
	var n = 0;
	var dvs = Schedule.getCourseDivs(sem);
	
	//metacourses for which layout should be deferred.
	var defer = [];
	var usedCourses = [];
	
	for (var x = 0; x < dvs.length; ++x) {
		var qel = $(dvs[x]);
		qel.css("left",n*Ticks.credw);
		
		if (qel.hasClass("metac")) {
			var metacourse = qel.data("course");
			var rul = Rules.getRuleFromName(metacourse["Code"]);
			var accept = false;
			//if we've found a metacourse, look for other accepting courses
			for (var y = 0; y < dvs.length; ++y) {
				if (y != x) {
					//if we're accepting, move towards 
					if (rul.accept($(dvs[y]).data("course")["Code"]) == Rules.ACCEPT_YES) {
						//make sure the course hasn't already been used to accept
						if ($.inArray(y, usedCourses) < 0) {
							usedCourses.push(y);
							accept = true;
							defer.push([qel, $(dvs[y])]);
						}
						//qel.css("left",$(dvs[y]).css("left"));	
					}
				}
			}
			
			//if no accepting block was found, add credits on
			if (accept) {
				metacourse["accepting"] = true;
			} else {
				metacourse["accepting"] = false;
				n += qel.data("numcredits");	
			}
			qel.data("course", metacourse);
		} else {
			//otherwise, move onwards
			n += qel.data("numcredits");			
		}
	}
	
	for (var x = 0; x < defer.length; ++x) {
		defer[x][0].css("left", defer[x][1].css("left"));
	}
};
