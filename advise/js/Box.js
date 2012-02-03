/**
@namespace Used for creating/managing course and meta boxes that are dropped on the schedule.
*/
var Box = {	
};

/**
Locate a semester tick where a drop was occuring. Arguments: each point has x,y coordinates.
@param lowercorner the very top corner of all divs
@param firstcorner a point one "tick" away in each direction from the lowercorner
@param pos the location where the element was dropped
@return [semester, credit], where semester corresponds to a semester index and credit corresponds to the credit tick.
 -1 for either if it isn't in bounds.
*/
Box.identifyDropLoc = function(/**Array*/ lowercorner, /**Array*/ firstcorner, /**Array*/ pos) {
	var xr = pos[0] - lowercorner[0];
	var yr = pos[1] - lowercorner[1];
	
	var xsp = firstcorner[0] - lowercorner[0];
	var ysp = firstcorner[1] - lowercorner[1];
	
	var sem = Math.floor(yr/ysp);
	if (sem < 0 || sem >= Ticks.NUMSEMS) {
		sem = -1;
	}
	var tick = Math.floor(xr/xsp);
	if (tick < 0 || tick >= Ticks.MAXCREDITS) {
		tick = -1;
	}
	
	return [sem, tick];
};

/**
Make the given jQuery object a draggable course/metacourse
@param jqdiv the box to make draggable
*/
Box.makeDraggable = function(jqdiv) {
	jqdiv.draggable({
			appendTo: document.body,
			helper: "clone",
			zIndex: 500,
			opacity: 0.5,
			delay: 100,
			cursor: "move",
			start: function(e, ui) {
				var src = Box.srcFromDrag(e);
				this.ismeta = $(src).hasClass("metac");
				var totalcred = $(src).data("numcredits");
				var course = $(src).data("course");
				
				//hide the dragging course if it was not from "all courses"
				if (src.parentNode.id != "clinner") {
					$(src).css("display","none");
				}
				
				//highlight the accepting blocks
				for (var x = 0; x < Ticks.NUMSEMS; ++x) {
					var semcred = Schedule.getSemesterCredits(x);
					if (semcred + totalcred <= Ticks.MAXCREDITS) {
						Ticks.highlightTicks(x, semcred, semcred + totalcred);
					}
				}
				
				//obtain measurements for where the semesters actually are
				this.lowercorner = $("#sem-0-0").offset();
				this.lowercorner = [this.lowercorner.left, this.lowercorner.top];
				this.firstcorner = $("#sem-1-1").offset();
				this.firstcorner = [this.firstcorner.left, this.firstcorner.top];
				this.parentsem = src.parentNode;
				var psemno = parseInt(src.parentNode.id.substring(3));
				
				if (!this.ismeta) {
					var accepting = [];
					//highlight all accepting metaboxes and store them
					$(".metac").each(function(i, el) {
						var qel = $(el);
						var acceptstate = qel.data("rule").accept(course["Code"]);
						if (acceptstate > 0) {
							accepting.push([acceptstate, el]);
							var highlight = Rules.acceptColorForCode(acceptstate);
							qel.css("border","2px solid " + highlight);
							$(qel.children()[0]).css("background-color",highlight);
							
							//if the accepting metabox previously held this course,
							//clear the box's accept state
							if (psemno == parseInt(el.parentNode.id.substring(3))) {
								qel.data("hascourse", false);
							}
						}
					});
					this.accepting = accepting;
				}
				
				this.dragitem = src;
			},
			drag: function(e, ui) {
				//var smt = Box.identifyDropLoc(this.lowercorner, this.firstcorner, [e.clientX, e.clientY]);
			},
			stop: function(e, ui) {
				var src = this.dragitem;
				if (src == null) { return; }
				//was the dragged course from the schedule?
				var fromschedule = $(src.parentNode).hasClass("semblock");
				var totalcred = $(src).data("numcredits");
				var newcourse = $(src).data("course");
				var coords = [e.originalEvent.clientX, e.originalEvent.clientY];
				var smt = Box.identifyDropLoc(this.lowercorner, this.firstcorner, coords);
				var successfuldrop = smt[0] != -1 && smt[1] != -1;
			
				//unhighlight all highlighted tick marks
				for (var x = 0; x < Ticks.NUMSEMS; ++x) {
					var semcred = Schedule.getSemesterCredits(x);
					Ticks.delightTicks(x, Math.max(0, semcred - totalcred - 1), 
									Math.min(Ticks.MAXCREDITS, semcred + totalcred + 1));
				}

				if (!this.ismeta) {
					var oneremoved = false;
					
					//unhighlight all accepting metaboxes
					for (var x = 0; x < this.accepting.length; ++x) {
						var qel = $(this.accepting[x][1]);
						var normal = Utils.colorstr(qel.data("course").Color);
						qel.css("border","2px solid " + normal);
						$(qel.children()[0]).css("background-color",normal);
					}
				}

				//successful drop
				if (successfuldrop) {
					var semcred = Schedule.getSemesterCredits(smt[0]);

					var dropped = $(src).data("clone")();
					dropped.css({
						"position":"absolute",
						"left":semcred*Ticks.credw,
						"height":SEMHEIGHT,
						"top":(this.ismeta) ? "-15px" : "0px"
						/*"z-index":500*/
					}).appendTo("#sem" + smt[0]);
					
					if (!this.ismeta) {
						Tips.updateAlerts(dropped);
					}
				} 
				
				//remove the old course it was already on the schedule.
				if (fromschedule) {
					//clear credits before repacking divs; this course will be removed soon anyway.
					$(src).data("numcredits",0);
					Schedule.repackDivs(src.parentNode.id.substring(3));
					src.parentNode.removeChild(src);
				}
				
				Schedule.repackDivs(smt[0]);
				
				Store.setchanged(true);
				
				Rules.updateAllRules();
			}
		});
};

/**
Get a course box for the given course object
@param course a structure with course data
*/
Box.getCourseBox = function(/**Course*/ course) {
	var ncred = Schedule.getCredits(course);
	var dv = $("<div>")
		.data("numcredits",ncred)
		.data("course",course)
		.data("savestr","Course/" + course["Code"])
		.data("clone", 
			(function(course) {
				return function() {
					return Box.getCourseBox(course);
				};
			})(course)
		)
		.css({
			"width":(Ticks.credw*ncred) + "px",
			"background-color":(course.Color) ? Utils.colorstr(course.Color) : "#CCCCFF"
		})
		.addClass("course")
		.append(
			$("<div>").addClass("coursetitle").text(course["Nickname"])
		)
		.append(
			$("<div>").addClass("coursecode").text(course["Code"])
		)
		.mouseover(function() {
			var course = $(this).data("course");
			this.loaddesc = null;
			
			var reqs = 
				((course["Corequisites"] == "") ? "" : " Coreqs: ") +
				course["Corequisites"] + 
				((course["Prerequisites"] == "") ? "" : " Prereqs: ") +
				course["Prerequisites"] + "&nbsp;";
			
			var content = $("<div>");
			//place any alerts in the info area
			var alerts = $(this).data("alerts");
			if (alerts) {
				for (var x = 0; x < alerts.length; ++x) {
					$("<div>")
						.addClass("coursealert")
						.append(
							$("<img>")
								.css("margin-right","3px")
								.attr("src",Images.forCode(alerts[x][0]))
						)
						.append(
							$("<div>").css("display","inline").text(alerts[x][1])
						)
						.appendTo(content);
				}
			}
			
			spaceify = function(txt) {
				if (txt == "") {
					return "&nbsp;";
				} else {
					return txt;
				}
			};
			
			//make the course info tooltip
			var innerc = $("<dl>")
				.addClass("coursetip")
				.append($("<dt>").text("Code"))
				.append($("<dd>").html(spaceify(course["Code"])))
				.append($("<dt>").text("Title"))
				.append($("<dd>").html(spaceify(course["Title"])))
				.append($("<dt>").text("Credits"))
				.append($("<dd>").html(spaceify(course["Credits"])))
				.append($("<dt>").text("Faculty"))
				.append($("<dd>").html(spaceify(course["Instructors"])))
				//.append($("<dt>").text("Hours"))
				//.append($("<dd>").text(course["Hours"]))
				.append($("<dt>").text("Offered"))
				.append($("<dd>").html(spaceify(course["Offered"])))
				.append($("<dt>").text("Requires"))
				.append($("<dd>").html(spaceify(reqs)))
				.append($("<dt>").text("Info"))
				.append(this.loaddesc = $("<dd>").text("Click for description"))
				.appendTo(content);
			
			Tips.show($(this),content,300);
		})
		.click(function() {
			(function(elm) {
				$.getJSON("db/req.php?q=getdesc", {code: course["Code"]},
				function(data) {
					elm.html(data[0]["Description"]);
				});
			})(this.loaddesc);	
		})
		.mouseout(function() {
			Tips.hide();	
		});
	Box.makeDraggable(dv);
	return dv;
};

/**
Get a metacourse box for the given rule object
@param rule a rule object, as given by one of the classes in Rules
@param savestr additional rule information associated with a save. See Store.serialize
*/
Box.getMetaBox = function(/**Rule*/ rule, /**String*/ savestr) {
	//	title: the title to display
	//	course: should contain: 
	//		.Credits the number of credits for the metabox
	//		.Code a unique code for the metabox
	var course = rule.getCourse(savestr);
	var title = rule.getTitle();
	var ncred = Schedule.getCredits(course);
	var dv = $("<div>")
		.data("numcredits",ncred)
		.data("course",course)
		.data("rule",rule)
		.data("savestr", savestr)
		.data("clone",
			(function(rule, savestr) {
				return function() {
					return Box.getMetaBox(rule, savestr);
				};
			})(rule, savestr)
		)
		.addClass("course")
		.addClass("metac")
		.css({
			"width":(Ticks.credw*ncred) + "px",
			"border-color":(course.Color) ? Utils.colorstr(course.Color) : "#CCCCFF"
		})
		.append(
			$("<div>")
			.addClass("metactitle")
			.css({
				"background-color":(course.Color) ? Utils.colorstr(course.Color) : "#CCCCFF"
			})
			.text(title)
		)
		.mouseover(function() {
			var course = $(this).data("course");
			var rule = $(this).data("rule");	
			
			//defer to the rule for the popup contents
			var content = rule.getPopup();
			
			Tips.show($(this),content,300);
		})
		.mouseout(function() {
			Tips.hide();
		})
		.click(function() {
			//fill the search box with the searcher for this metacourse
			var searchtext = $(this).data("rule").getSearchText();
			
			if (searchtext != "") {
				$("#search").attr("value",searchtext);
				$("#search").focus();
				$("#search").select();
				Buttons.dosearch();
			}
		});
	Box.makeDraggable(dv);
	return dv;
};

/**
Get the source div from a drag event
@param e a drag event object
*/
Box.srcFromDrag = function(/**Event*/ e) {
	var src = e.originalEvent.currentTarget;//e.originalTarget;
	if (!src) {
		src = e.originalEvent.srcElement;
	}

	while (src && (!$(src).data || !$(src).data("numcredits"))) {
		src = src.parentNode;
	}
	return src;
};