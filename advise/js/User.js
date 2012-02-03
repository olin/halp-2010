/**
@constructor
@property username The user's username
@property password The user's password
@param success The function to call upon a successful login
@param failure The function to call upon a failed login
@class Responsible for managing user information, including login/logout processes and preferences.
*/
function User(/**String*/ username, /**String*/ password, /**Function*/ success, /**Function*/ failure) {
	this.username = username;
	this.password = password;
	var usr = this;
	$.post("db/req.php?q=login", 
		{
			"username":username,
			"password":password
		},
		function(data) {
			usr.setGuestOptions();
			
			//check to see if login was successful
			if (data.length > 0) {
				usr.udata = data[0];
				usr.udata["Semesters"] = eval("(" + usr.udata["Semesters"] + ")");
				success();
			} else {
				failure();
			}
		}, "json");
}

/**
Show or hide the options in the UI based upon whether the user is a guest.
*/
User.prototype.setGuestOptions = function() {
	var isguest = (this.username == User.GUEST_NAME);
	$("#btn-save").css("display", isguest ? "none" : "inline");
	$("#mt_managecourses").css("display", isguest ? "none" : "block");
}

/**
Update the UI with the user's information
*/
User.prototype.updateUI = function() {
	var that = this;
	$(".usertext").each(function() {
		$(this).html(that.username);
	});	
};

/**
@return the user's username
*/
User.prototype.getName = function() {
	return this.username;
};

/**
@return the abbreviation for the user's major (ECE, ME, etc.)
*/
User.prototype.getMajor = function() {
	return this.udata["Major"];
};

/**
@param major the abbreviation for the user's major (ECE, ME, etc.)
*/
User.prototype.setMajor = function(/**String*/ major) {
	$.post("db/req.php?q=setmajor", 
	{
		"major":major
	});
	this.udata["Major"] = major;
	Options.updatemajordesc();
};

/**
@return an array of the user's semester indices
*/
User.prototype.getSemesters = function() {
	return this.udata["Semesters"];
};

/**
@param semesters an array of the user's semester indices
*/
User.prototype.setSemesters = function(/**Array*/ semesters) {
	this.udata["Semesters"] = semesters;
	
	if (this.username != User.GUEST_NAME) {
		$.post("db/req.php?q=setsemesters", 
		{
			"semesters":JSON.stringify(user["Semesters"])
		},
		function(data) { }, "text");
	}
};

/**
Guest username
@constant
*/
User.GUEST_NAME = "Guest";
/**
Guest password
@constant
*/
User.GUEST_PASS = "Guest";