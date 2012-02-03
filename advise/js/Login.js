/**
@namespace Singleton used for managing login status and ensuring a user is logged in.
*/
var Login = {
};

Login.initialized = false;

/**
Function to call when a login is finished (after ensureLogin)
*/
Login.finishfn = false;

/**
Make sure a user is logged in that is not the guest account.
If the guest account is logged in, display a registration alert
@param fn the function to invoke after ensuring the user is logged in
*/
Login.ensureLogin = function(/**Function*/ fn) {
	Login.initLogin();
	if (curuser.username == User.GUEST_NAME) {
		Login.finishfn = fn;
		Login.dialogShow("You must be logged in to perform that action.");
	} else {
		fn();
	}
};

/**
Wrap the call to show the dialog, with the specified text.
@param text the text to display above the entry fields
*/
Login.dialogShow = function(/**String*/ text) {
	$("#login-msg").html(text);
	$("#poplogin").dialog({
		title:"Login",
		modal:true,
		resizable:false,
		width:300,height:300,
		overlay: {
			"background-color":"#000000",
			"opacity":"0.75",
			"-moz-opacity":"0.75"
			}
	});
	$("#poplogin").dialog("open");
	$("#login-user").get(0).focus();
};

/**
Ask a user to log in, without showing the "login required to perform action" message
*/
Login.showLogin = function() {
	Login.initLogin();
	Login.dialogShow("Please enter your username and password:");
};

/**
Ensure that the login area is initialized
*/
Login.initLogin = function() {
	if (!this.initialized) {
		this.initialized = true;
	} else {
		return;
	}
	
	Login.clearLogin();
	
	//enable the login area if it was disabled for some reason
	Login.setEnabled(true);
	
	$("#poplogintabs > ul").tabs();
};

/**
Clear the login fields
*/
Login.clearLogin = function() {
	//clear the login fields
	$("#login-user").attr("value","");
	$("#login-pass").attr("value","");	
}

/**
Callback for a click on the login interface
*/
Login.doLoginClick = function() {
	var euser = $("#login-user").attr("value");
	var epass = $("#login-pass").attr("value");
	Login.setEnabled(false);
	
	$("#login-msg").text("Please wait, processing...");
	
	curuser = new User(euser, epass, 
		function() {
			Schedule.loadSchedule(function() {
				//set the current user information on the UI
				curuser.updateUI();
				schedPane.resize();
				
				//re-enable login if the user wants to login again
				Login.clearLogin();
				Login.setEnabled(true);
				Login.finishLogin();
			});
		},
		function() {
		$("#login-msg").text(
			"Sorry, but your credentials do not match our records."	
		);
		
		Login.setEnabled(true);
	});
};

/**
Callback for a click on the "register" button
*/
Login.doRegisterClick = function() {
	var addr = $("#register-email").attr("value");
	
	//do a get to the registration form
	$.get("register.php", {"mailto":addr}, function(data, status) {
		$("#register-status").text("Email sent to " + addr);
	});
}

/**
Callback for the "forgot password" button
*/
Login.doForgotPassClick = function() {
	var username = $("#login-user").attr("value");
	if (username.length < 2) {
		$("#login-msg").text("Please type your username, then click the 'lost password' link.");
	} else {
		$("#login-msg").text("Sending request...");
		$.post("db/req.php?q=forgotpass",
			{
				"username":username
			},
			function(data) {
				$("#login-msg").text(data);
			}, "json");
	}
}

/**
set the login area to be enabled or disabled
@param bool should the login area be enabled (true) or disabled (false)
*/
Login.setEnabled = function(/**Boolean*/ bool) {
	if (bool) {
		$("#login-user").removeAttr("disabled");
		$("#login-pass").removeAttr("disabled");			
		$("#login-button").removeAttr("disabled");			
	} else {
		$("#login-user").attr("disabled","disabled");
		$("#login-pass").attr("disabled","disabled");
		$("#login-button").attr("disabled","disabled");
	}
};

/**
Should be invoked when a load is finished
*/
Login.finishLogin = function() {
	$("#poplogin").dialog("close");
	if (Login.finishfn) {
		Login.finishfn();
		Login.finishfn = false;
	}
};

/**
Callback for keypress in password field
*/
Login.passKeyPress = function(e) {
	if (e.keyCode == 13) {
		Login.doLoginClick();
	}
};

/**
Callback for keypress in registration email field
*/
Login.registerKeyPress = function(e) {
	if (e.keyCode == 13) {
		Login.doRegisterClick();
	}
};