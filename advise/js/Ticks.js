/**
@namespace Used for managing the individual credit "ticks" in the semester interface
*/
var Ticks = {
};

/**
The minimum number of credits to be enrolled at Olin
*/
Ticks.CREDITS_MINIMUM = [12, "#FFDDDD"];
/**
The recommended number of credits
*/
Ticks.CREDITS_NORMAL = [16, "#DDFFDD"];
/**
The maximum number of credits without a petition
*/
Ticks.CREDITS_MAXIMUM = [20, "#FFFFCC"];
/**
The number of credits shown in the interface
*/
Ticks.CREDITS_ABSMAX = [24, "#FFDDDD"];
/**
Shorthand for Ticks.CREDITS_ABSMAX[0]
*/
Ticks.MAXCREDITS = Ticks.CREDITS_ABSMAX[0];

/**
The initial width of one credit "tick" in pixels
*/
Ticks.credw = (480+240)/Ticks.MAXCREDITS;

Ticks.NUMSEMS = 8;

/**
@param sem the semester index (0 to NUMSEMS)
@param tick the credit index
@return a jquery object for the given credit mark
*/
Ticks.get = function(/**int*/ sem,/**int*/ tick) {
	return $("#sem-" + sem + "-" + tick);
};

/**
Resize all semester ticks according to Ticks.credw, the crdit width
*/
Ticks.resize = function() {
	for (var sem = 0; sem < Ticks.NUMSEMS; ++sem) {
		for (var t = 0; t < Ticks.MAXCREDITS; ++t) {
			Ticks.get(sem, t).css(Ticks.origTickStyle(sem, t));
		}
	}
};
	
/**
@return a dictionary corresponding to the original tick style
*/
Ticks.origTickStyle = function(sem, tick) {
	tdict = {
		"left": (Ticks.credw*tick) + "px", 
		"width": Ticks.credw + "px",
		"height": SEMHEIGHT + "px",
		"text-align": "center",
		"color": "#FFFFFF",
		"font-size": Math.floor(Ticks.credw/2) + "px",
		"font-weight": "bold",
		"border-right": "none",
		"border-top": "none",
		"border-bottom": "none",
		"margin": "0px"
		};
	
	if ((tick % 4) == 0) {
		tdict["borderLeft"] = "2px solid #909090";
	}
	else {
		tdict["borderLeft"] = "1px dotted #909090";
	}
	
	if 			(tick < Ticks.CREDITS_MINIMUM[0]) {
		tdict["background-color"] = Ticks.CREDITS_MINIMUM[1];
	} else if 	(tick < Ticks.CREDITS_NORMAL[0]) {
		tdict["background-color"] = Ticks.CREDITS_NORMAL[1];
	} else if 	(tick < Ticks.CREDITS_MAXIMUM[0]) {
		tdict["background-color"] = Ticks.CREDITS_MAXIMUM[1];
	} else if 	(tick < Ticks.CREDITS_ABSMAX[0]) {
		tdict["background-color"] = Ticks.CREDITS_ABSMAX[1];	
	}
	
	return tdict;
};
	
/**
highlight the given semester credit ticks
@param sem the semester index to highlight in
@start the starting credit index to highlight
@end the ending credit index to highlight
*/
Ticks.highlightTicks = function(sem, start, end) {
	Ticks.get(sem, start).css({
		borderLeft: "4px solid #01009A"
	});
	Ticks.get(sem, end - 1).css({
		borderRight: "4px solid #01009A"
	});
	Ticks.get(sem, end).css({
		marginLeft: "4px"
	});
	for (var x = start; x < end; ++x) {
		Ticks.get(sem,x).css({
			borderTop: "4px solid #01009A",
			borderBottom: "4px solid #01009A",
			margin: "-2px"
		});
	}
};
	
/**
unhlighlight the given semester credit ticks
@param sem the semester index to unhighlight
@start the starting credit index to unhighlight
@end the ending credit index to unhighlight
*/
Ticks.delightTicks = function(sem, start, end) {
	for (var x = start; x < end; ++x) {
		Ticks.get(sem,x).css(Ticks.origTickStyle(sem, x));
	}
};