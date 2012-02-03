/**
@namespace Functions for dealing with user preferences
*/
var Options = {
};

/**
Update the UI with new major selection information
*/
Options.updatemajordesc = function() {
	var major = majors[parseInt($("#majorselect").attr("value"), 10)];
	$("#majordesc").html(major["Name"]);
	$("#savemajor").attr("disabled", (major["Code"] == curuser.getMajor()) ? "disabled" : "");
}

/**
Save the current major selection
*/
Options.savemajor = function() {
	var major = majors[parseInt($("#majorselect").attr("value"), 10)];
	curuser.setMajor(major["Code"]);
}