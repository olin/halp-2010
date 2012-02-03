/**
@namespace Used for creating the "Rules" descriptors that populate the bottom interface
*/
var Rules = {
};

/**
update all rules on the schedule in the lower container
*/
Rules.updateAllRules = function() {
	var updatefun = function(i, el) {
		var fn = $(el).data("update");
		if (fn) {
			//update the rule state
			fn();
		}
	};
	
	//update rulebox rules
	$(".rulebox").children().each(updatefun);
	$("#creditsrules").children().each(updatefun);
	
	//update the credits rules
	Rules.updateCollapseState();
};

/**
Collapse any rules boxes that no longer have visible boxes
*/
Rules.updateCollapseState = function() {
	//will we need a rules repositioning afterwards?
	var needLayout = false;
	$(".rulebox").each(function(i, el) {
		var hide = true;
		$(el).children().each(function(i, el) {
			if ($(el).css("display") != "none") {
				hide = false;
			}
		});
		
		var parent = $(el).parent();
		
		needLayout |= (parent.data("showing") == !hide);
		
		Rules.showhide(parent, !hide);
	});
	
	if (needLayout) {
		positionRules();
	}
}

/**
Show or hide the rule with the given name
@param name the rule div to show or hide
@param bool should it be shown (true) or hidden (false) ?
*/
Rules.showhide = function(/**jquery*/ elm, /**Boolean*/ bool) {
	elm.css({
		"width":((bool)?Rules.getRulesBoxWidth()+"px":25+"px")
	});
	elm.data("showing",bool);
	
	//show or hide the actual box
	$(elm.children()[1]).css({
		"display":(bool)?"block":"none"
	});
	//show or hide the header text
	$($(elm.children()[0]).children()[1]).css({
		"display":(bool)?"inline":"none"
	});
	//show or hide the collapsed box
	$(elm.children()[2]).css({
		"display":(bool)?"none":"block"
	});
	
	this.triimg(elm, bool, false);
};

/**
Set the triangle image to the given showing state
@param elm the rule div to set the triangle show state on
@param bool Should the image be shown (true) or hidden (false) ?
@param over Display the over image?
*/
Rules.triimg = function(/**String*/ elm, /**Boolean*/ bool, /**Boolean*/ over) {
	var elm = $($(elm.children()[0]).children("img")[0]);
	var bname = (bool) ? "img/downarrow" : "img/rightarrow";
	bname += (over) ? "_over.gif" : ".gif";
	elm.attr("src", bname);
};

/**
@param name the rule to find
@return a reference to the rule div with the given name
*/
Rules.getRuleDiv = function(/**String*/ name) {
	var match = $(".rulecat").filter(function(i) {
		if ($(this).data("name") == name) {
			return true;
		}
		return false;
	});
	
	if (match.length != 1) {
		error("Rule div " + name + " not found.");
	}
	
	return match[0];
};

/**
@param name the name of the rule to get
@return the rule object corresponding to the given name
*/
Rules.getRuleFromName = function(/**String*/ name) {
	if (!rulesobjs[name]) {
		error("Rule " + name + " not found.");
	}
	return rulesobjs[name];
};

/**
@return the correct width for a rule box 
*/
Rules.getRulesBoxWidth = function() {
	return Ticks.credw * 5;
};

/**
A rule meta-block knows it cannot accept a course
@constant
*/
Rules.ACCEPT_NO = 0;

/**
A rule meta-block knows it can accept a course
@constant
*/
Rules.ACCEPT_YES = 1;

/**
Primarily for "credits" blocks - accepting state is not known
@constant
*/
Rules.ACCEPT_MAYBE = 2;

/**
@return a highlight color for the given accept code
*/
Rules.acceptColorForCode = function(/**int*/ code) {
	switch (code) {
		case Rules.ACCEPT_NO:
			return "#9999FF";
		case Rules.ACCEPT_YES:
			return "#FFFF66";
		case Rules.ACCEPT_MAYBE:
			return "#9999FF";
	}
	return "#9999FF";
}

/**
@constructor Creates a new Credits rule
@property desc a description for the rule to be displayed to the user
@property types the course code prefixes to use for activating the rule
@property credits the number of threshold credits
@class Used for keeping track of a number of credits in a specified area
*/
Rules.Credits = function(/**String*/ desc, /**Array*/ types, /**int*/ credits) {
	this.desc = desc;
	this.types = types;
	this.credits = credits;
};
Rules.Credits.prototype.accept = function(code) {
	return Rules.ACCEPT_NO;
};
Rules.Credits.prototype.match = function(course) {
	//for an accepting metacourse, return 0 credits
	if (course["accepting"]) {
		return 0;
	}
	if (this.types.length == 0) {
		return Schedule.getCredits(course);
	}
	
	var nc = 0;
	var cred = Schedule.getAllCredits(course["Credits"]);
	for (var x = 0; x < cred.length; ++x) {
		for (var y = 0; y < this.types.length; ++y) {
			if (cred[x][1] == this.types[y]) {
				nc += cred[x][0];
			}
		}
	}
	return nc;
};
Rules.Credits.prototype.getDivs = function() {	
	var div = $("<div>")
		.css({
			"padding":"1px",
			"padding-left":"3px",
			"padding-right":"3px",
			"background-color":"#BBBBBB"
		})
		.append(
			$("<div>").text("0/" + this.desc)
		)
		.append(
			$("<div>")
				.css({
					"height":"20px",
					"border":"1px solid #000000"
				})
				.append(
					$("<div>")
					.css({
						"border-top":"2px solid #33CCFF",
						"border-bottom":"2px solid #3366FF",
						"height":"16px",
						"background-color":"#3399FF",
						"width":"0px"
					})
				)
		);
		
	(function(d, rule) {
		d.data("update", function() {
			//count the number of qualifying credits
			var allc = Schedule.getAllCourses();
			var cur = 0;
			for (var x = 0; x < allc.length; ++x) {
				cur += rule.match(allc[x]);
			}
			
			var progdiv = $(d.children()[1]);
			$(d.children()[0]).text(cur + "/" + rule.desc);
			$(progdiv.children()[0]).css(
				/*"width",Math.ceil(Math.min(cur / rule.credits, 1) * progdiv.width()) + "px"*/
				"width", Math.ceil(Math.min(cur / rule.credits, 1) * 100) + "%"
			);
		})
	})(div, this);
	return [div];
};
Rules.Credits.prototype.getPopup = function() {
	return $("<div>");	
};
Rules.Credits.prototype.getSearchText = function() {
	return "";	
};

/**
@constructor Creates a new SingleCourse rule
@property code the course code to display and trigger on
@class Used for a rule that calls for a single course
*/
Rules.SingleCourse = function(code) {
	this.code = code;
};
Rules.SingleCourse.prototype.accept = function(code) {
	return false;
};
Rules.SingleCourse.prototype.getDivs = function() {
	var course = Schedule.getCourseFromCode(this.code);
	course["Color"] = this.Color
	var div = Box.getCourseBox(course);
	(function(d) {
		div.data("update", function() {
			var present = Schedule.scheduleHasCourse(d.data("course")["Code"]);
			d.css("display", present ? "none" : "inline");
		});
	})(div);
	
	return [div];
};
Rules.SingleCourse.prototype.getPopup = function() {
	return $("<div>");	
};
Rules.SingleCourse.prototype.getSearchText = function() {
	return this.code;	
};

/**
@constructor Creates a new NOf rule
@property desc a description of this rule to be shown in the details view
@property num the number of courses to require
@property list the list of possible courses
@property credits and flavor used to "flavor" the course credits - use "NA" if there is no consistent flavor
@class Used for a requirement that requires a selection from a certain course list
*/
Rules.NOf = function(/**String*/ desc, /**int*/ num, /**Array*/ list, /**String*/ flavor) {
	this.desc = desc;
	this.num = num;
	this.list = list;
	this.flavor = flavor;
};
Rules.NOf.prototype.accept = function(code) {
	for (var x = 0; x < this.list.length; ++x) {
		if (code == this.list[x]) {
			return Rules.ACCEPT_YES;
		}
	}
	return Rules.ACCEPT_NO;
};
Rules.NOf.prototype.getTitle = function() {
	return this.desc;
}
Rules.NOf.prototype.getCourse = function(savestr) {
	return {
			"Credits":this.flavor,
			"Code":this.cname,
			"Color":this.Color
		};
}
Rules.NOf.prototype.getDivs = function() {
	var divs = [];
	this.dvsshow = []; //maintenance for the rule of which divs are showing
	for (var x = 0; x < this.num; ++x) {
		this.dvsshow.push(true);
		var div = Box.getMetaBox(this,"Rule/" + this.cname + "/" + x);
		(function(d, myidx, rule) {
			div.data("update", function() {
				//count the number that are currently showing
				var show = 0;
				for (var y = 0; y < rule.dvsshow.length; ++y) {
					show += (rule.dvsshow[y]) ? 1 : 0;
				}
				
				//count the number of qualifying courses on the schedule
				var qualify = 0;
				for (var y = 0; y < rule.list.length; ++y) {
					qualify += Schedule.scheduleHasCourse(rule.list[y]) ? 1 : 0;
				}
				
				qualify += Schedule.scheduleHasCourse(rule.cname);
				
				//move in the right direction if we can
				if (show < rule.num - qualify) {
					if (!rule.dvsshow[myidx]) {
						rule.dvsshow[myidx] = true;
					}
				} else if (show > rule.num - qualify) {
					if (rule.dvsshow[myidx]) {
						rule.dvsshow[myidx] = false;
					}
				}
				
				d.css("display", rule.dvsshow[myidx] ? "block" : "none");
			});
		})(div, x, this);
		
		divs.push(div);
	}
	return divs;
};
Rules.NOf.prototype.getPopup = function() {
	//Build a list of possible courses
	var cont = $("<div>")
		.addClass("metacoursetip")
		.text("Schedule " + this.num + " of the following courses:");
	var courselst = $("<ul>");
	cont.append(courselst);
	for (var x = 0; x < this.list.length; ++x) {
		var code = this.list[x];
		var course = Schedule.getCourseFromCode(this.list[x]);
		courselst.append(
			$("<li>")
				.append($("<div>")
					.css("display","inline")
					.css("font-weight","bold")
					.text(code + ": "))
				.append($("<div>")
					.css("display","inline")
					.text(course["Title"]))
			);
	}
	cont.append(
		$("<div>")
			.css({
				"font-style":"italic",
				"font-weight":"bold"
			})
			.text("Click to show options...")
	);
	return cont;
};
Rules.NOf.prototype.getSearchText = function() {
	return this.list.join(",");	
};

/**
@constructor Creates a new NCredits rule
@property num the number of credits to require
@property desc a description of this rule to be shown in the details view
@property flavor the "flavor" used to color the course's credits
@class Used for a requirement that requres a certain number of credits
*/
Rules.NCredits = function(/**int*/ num, /**String*/ desc, /**String*/ flavor) {
	this.num = num;
	this.desc = desc;
	this.flavor = flavor;
};
Rules.NCredits.prototype.accept = function(code) {
	return Rules.ACCEPT_MAYBE;
};
Rules.NCredits.prototype.getTitle = function() {
	return this.num + " Cr " + this.catname;
};
Rules.NCredits.prototype.getCourse = function(savestr) {
	return {
			//find the div number and add 1 to find the number of credits.
			"Credits":(parseInt(savestr.split("/")[2],10)) + " " + this.flavor,
			"Code":this.cname,
			"Color":this.Color
		};
};
Rules.NCredits.prototype.getDivs = function() {
	//make a div corresponding to various credit widths
	var divs = [];
	for (var x = 1; x <= 4; ++x) {
		var div = Box.getMetaBox(this, "Rule/" + this.cname + "/" + x);
		(function(d, crnum, rule) {
			div.data("update", function() {
				var remain = rule.num - Schedule.scheduleCourseCredits(rule.cname);
				//if the remaining credits are more than this minibox, just update the text
				if (remain >= crnum) {
					d.css("display","inline");
					$(d.children()[0]).text(remain + " Cr " + rule.catname);
				}
				//otherwise, hide the box.
				else {
					d.css("display","none");
				}
			});
		})(div, x, this);
		
		divs.push(div);
	}
	return divs;
};
Rules.NCredits.prototype.getPopup = function() {
	return $("<div>").addClass("metacoursetip").text(this.desc);	
};
Rules.NCredits.prototype.getSearchText = function() {
	return "";	
};