/**
@constructor
@class Simple client-side validation for the registration form
*/
function Validator() {
	this.fields = {};
	this.nameslst = [];
};
/**
Include a new field to check
@param name the name of the field to add
@param group the name of the div to set as having an error when any member does. Can be null.
@param fn the function to be performed when validating the given field name
*/
Validator.prototype.addField = function(/**String*/ name, /**String*/ group, /**Function*/ fn) {
	var match = $("#" + name);
	if (match.length == 1) {
		//the field to apply an error style to
		var update = $("[for=" + name + "]");
		if (update.length > 0) {
			match.data("label", update);	
		} else {
			match.data("label", match);
		}
		this.fields[name] = {
			"fn": fn,
			"group": group,
			"status": true
		};
		this.nameslst.push(name);
	} else {
		Utils.error("Could not find the field named " + name);
	}
};

/**
Check the status of the given element, and update its associated label.
@param el 
*/
Validator.prototype.check = function(/**Element*/ el) {
	var qel = $(el);
	var tag = qel.attr("id");
	var fn = this.fields[tag]["fn"];
	
	//check to see if the field is valid
	if (fn) {
		var result = fn(qel);
		//show an error by the label
		if (result) {
			qel.data("label").removeClass("errorstyle");
		} else {
			qel.data("label").addClass("errorstyle");
		}
		
		//show the error information, if any
		var errorbox = $("#" + qel.attr("id") + "_error");
		if (errorbox.length > 0) {
			errorbox.css("visibility", result ? "hidden" : "visible");
		}
		$("#accordion").accordion({header: "h3"});
		this.fields[tag]["status"] = result;
		
		this.updateGroups();
	} else {
		Utils.error("No assosciated validation function for field " + tag);	
	}
};

/**
Update the status of the Validator's groups
*/
Validator.prototype.updateGroups = function() {
	var groups = {};
	var groupnames = [];
	
	//build the list of groups as a dictionary of groupname => state
	for (var x = 0; x < this.nameslst.length; ++x) {
		var name = this.nameslst[x];
		var group = this.fields[name]["group"];
		var status = this.fields[name]["status"];
		
		if (groups[group]) {
			groups[group] = ((groups[group] == "good") && status) ? "good" : "bad";
		} else {
			groups[group] = status ? "good" : "bad";
			groupnames.push(group);
		}
	}
	
	//update the groups
	for (var x = 0; x < groupnames.length; ++x) {
		var group = groupnames[x];
		var status = (groups[group] == "good");
		var qel = $("#" + group);
		
		if (status) {
			qel.removeClass("errorstyle");
		} else {
			qel.addClass("errorstyle");
		}
	}
};

/**
Validate all fields in this Validator's list
*/
Validator.prototype.checkAll = function() {
	for (var x = 0; x < this.nameslst.length; ++x) {
		var qel = $("#" + this.nameslst[x]);
		this.check(qel.get(0));
	}
};

/**
Check the stauts of every validation area. It's a good idea to use checkAll before this.
@return whether all the validated fields are ready to go.
*/
Validator.prototype.getAllStatus = function() {
	var okay = true;
	for (var x = 0; x < this.nameslst.length; ++x) {
		okay = okay && this.fields[this.nameslst[x]]["status"];
	}	
	return okay;
};