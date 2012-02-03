/**
@namespace Singleton used for maintaining the semester drop-down boxen on the left portion of the course manager.
Semesters are indexed starting from 0 as Fall 2000
*/
var Semesters = {
};

/**
the number of semester options to show in the future
*/
Semesters.INFUTURE = 4; 

/**
@param idx the index of the semester to look up
@return "Fall" if the semester is a fall semester, "Spring" otherwise
*/
Semesters.fallspring = function(/**int*/ idx) {
	return (idx % 2 == 0) ? "Fall" : "Spring";
};

/**
@param idx the index of the semester to look up
@return The year of the given semester (2000, 2001, ...)
*/
Semesters.year = function(/**int*/ idx) {
	return 2000 + Math.floor((idx+1) / 2);
};

/**
@param idx the index of the semester to look up
@return The "short year" of the given semester ("'01", "'02", ...)
*/
Semesters.yearshort = function(/**int*/ idx) {
	var n = Math.floor((idx+1) / 2);
	if (n < 10) {
		return "'0" + n;
	} else {
		return "'" + n;
	}
};

/**
@param idx the index of the semester to look up
@return The fall/spring and short year of the semester combined.
*/
Semesters.fullstr = function(/**int*/ idx) {
	return Semesters.fallspring(idx) + " " + Semesters.yearshort(idx);
};

/**
Update all the semester drop-down boxes
*/
Semesters.updateselectors = function() {
	for (var x = 0; x < Ticks.NUMSEMS; ++x) {
		Semesters.updateselector(x);
		Semesters.updatealerts(x);
	}
};

/**
Update the alert boxes for all course boxes in the given semester 
@param sem the semester to update
*/
Semesters.updatealerts = function(/**int*/ sem) {
	Schedule.getCourseDivs(sem).each(function(i, el) {
		Tips.updateAlerts($(el));
	});
};

/**
Update the given semester drop-down selector
@param idx the index of the drop-down box to update (0 to the number of semesters shown in the UI)
*/
Semesters.updateselector = function(/**int*/ idx) { //update one semester selector
	//find the correct span to place in the options boxen
	var low = 0;
	var high = 0;
	if (idx == 0) {
		low = curuser.getSemesters()[idx] - Semesters.INFUTURE;
		high = curuser.getSemesters()[idx] + Semesters.INFUTURE;
	} else {
		low = curuser.getSemesters()[idx-1]+1;
		high = curuser.getSemesters()[idx] + Semesters.INFUTURE;
	}
	
	var el = $("#sdesc" + idx).html("");
	for (var x = low; x <= high; ++x) {
		el.append(
			$("<option>")
				.attr("value",x)
				.attr("selected", (x == curuser.getSemesters()[idx]) ? "selected" : "")
				.html(Semesters.fullstr(x))
		);
	}
	
	//HACK: IE makes the boxes explode if we don't reinsert them
	//	after repopulation.
	var elin = el.get(0);
	var pn = elin.parentNode;
	pn.removeChild(elin);
	pn.appendChild(elin);
};

/**
Triggered by a dropdown select event
*/
Semesters.eventchange = function() { 
	var idx = parseInt(this.id.substring(5), 10);
	var val = parseInt($(this).attr("value"), 10);
	var prevsems = curuser.getSemesters();
	for (var x = idx; x < Ticks.NUMSEMS; ++x) {
		prevsems[x] = x + (val-idx);
	}
	
	curuser.setSemesters(prevsems);
	
	for (var x = idx; x < Ticks.NUMSEMS; ++x) {
		Semesters.updateselector(x);
		Semesters.updatealerts(x);			
	}
};

/**
@return the semester value for the given semester index
@param idx the semester index (bounded by 0 and NUMSEMS)
*/
Semesters.semesterAt = function(/**int*/ idx) {
	return curuser.getSemesters()[idx];
};

/**
@return return the index corresponding to the given semester and year
@param fallspring either "Fall" or "Spring"
@param year the year, starting from 2000 (eg, 2010 is 10)
*/
Semesters.idxForSem = function(/**String*/ fallspring, /**int*/ year) {
	return year*2 + ((fallspring.toLowerCase() == "spring") ? 1 : 0);
};