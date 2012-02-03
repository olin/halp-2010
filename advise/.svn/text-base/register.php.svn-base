<?php
chdir("db");
include 'db/connect.php';
chdir("..");

//To make sure registration confirmations are legitimate
$MAGICAL_SALT = "0L1N-R0x0RZ-23oghash9g023hgioaeh";
//when to start the list of graduation years
$dat = getdate();
$GRAD_YEARS_START = $dat["year"];

//if we're mailing to a particular recipient
if (isset($_GET["mailto"]) && $_GET["mailto"] != "") {
	$addr = mysql_real_escape_string($_GET["mailto"]);
	
	//check to make sure the address isn't already in the database.
	$sql = "SELECT COUNT(*) FROM `Users` WHERE `Email` = '$addr'";
	$result = mysql_query($sql);
	$row = mysql_fetch_assoc($result);
	if ($row["COUNT(*)"] > 0) {
		//there's already a user with that email address
		$body = "This is a message from HALP. ".
			"A registration request was sent to your email address, but we already have an account with this email address. " .
			"If you forgot your password, please go to HALP, click 'login,' and 'forgot password?' ";
	} else {
		$linktxt = "http://" . $_SERVER['SERVER_NAME'] . $_SERVER['SCRIPT_NAME'] .
			"?mailfrom=" . urlencode($addr) . "&key=" . sha1($addr . $MAGICAL_SALT);
		$body = "This is a message from HALP. ".
			"To confirm your email address and continue the registration process, please click this link " .
			"or paste the address into your browser's address bar: " .
			"$linktxt";
	}
	
	mail(
		$addr, //recipient
		"HALP Registration", //subject
		$body, //body
		"From: HALP <ilari@students.olin.edu>"
	);
	
	//for testing purposes
	echo("Sending an email to " . $addr . ":<br><br>");	
	echo($body);
	exit(0);
}

//to create an account
if (isset($_GET["create"]) && $_GET["create"] == "yes") {
	
	$success = 0;
	$msg = "";
	
	//Calculate the semester save information
	if (!isset($_POST["f_gradyear"])) {
		$msg = "Error: graduation year not set.";
	}
	$gradyear = $_POST["f_gradyear"];
	$lastsem = ($gradyear - 2000) * 2 - 1;
	//assume the user started 8 semesters ago; this can be changed in the interface
	$sems = array();
	for ($x = $lastsem - 7; $x <= $lastsem; ++$x) {
		array_push($sems, $x);
	}
	$insert_sems = json_encode($sems);
	
	//start everyone off as ECE
	$insert_major = "ECE";
	
	$insert_email = mysql_real_escape_string($_POST["f_email"]);
	$insert_pass = mysql_real_escape_string($_POST["f_password"]);
	$insert_name = mysql_real_escape_string($_POST["f_username"]);
	
	//make sure there weren't any other users with the same name
	$stmt = "SELECT `Name` FROM `Users` WHERE `Name` = '$insert_name'";
	
	if (mysql_num_rows(mysql_query($stmt)) > 0) {
		$msg = "Error: User $insert_name already exists";
		$success = 0;
	} else {
		//drop in the new user
		$stmt = "INSERT INTO `Users` (`Name`, `Password`, `Email`, `Major`, `Semesters`) VALUES " .
			"('$insert_name', '$insert_pass', '$insert_email', '$insert_major', '$insert_sems')";
		$success = mysql_query($stmt);
		
		if ($success) {
			$msg = "Success: User $insert_name created";
			$success = 1;
		} else {
			$msg = "Error: User insert failure";
			$success = 0;
		}
		
		//grab the default schedule from the "Guest" user
		$stmt = "SELECT `Data` FROM `Saves` WHERE `Name` = 'Guest'";
		$result = mysql_query($stmt);
		$row = mysql_fetch_assoc($result);
		$insert_data = $row["Data"];
		
		//drop in the default schedule
		$stmt = "INSERT INTO `Saves` (`Name`, `Major`, `Data`) VALUES " .
			"('$insert_name', '$insert_major', '$insert_data')";
		mysql_query($stmt);
	}
	
	echo "{'success':$success, 'msg':'$msg'}";
	
	exit(0);
}

//if we want to actually register
if (isset($_GET["mailfrom"]) && $_GET["mailfrom"] != "") {
	$addr = mysql_real_escape_string($_GET["mailfrom"]);
	//check for the correct hash
	if (sha1($addr . $MAGICAL_SALT) != $_GET["key"]) {
		die("Error: could not confirm your email address; " .
			"please ensure your registration link was pasted properly.");
	}
} else {
	die("Error: no email address was received; ".
		"please ensure your registration link was pasted properly.");
}

//if we've reached this point, then we can proceed with registration
//So far, we only know the user's email address ($addr)

//get the default username
$emailpieces = array();
//thanks to http://us3.php.net/preg_match for the regex
if (!preg_match('/^([a-z0-9])(([-a-z0-9._])*([a-z0-9]))*\@([a-z0-9])' .	
	'(([a-z0-9-])*([a-z0-9]))+' . '(\.([a-z0-9])([-a-z0-9_-])?([a-z0-9])+)+$/i', $addr, $emailpieces)) {
	die("Error: invalid email address detected.");
}
$def_uname = $emailpieces[1] . $emailpieces[2];
?>
	
<html>
<head>
<title>HALP Registration</title>

<link rel="stylesheet" type="text/css" href="css/ui/ui.all.css" />
<link href="css/styles.css" title="defaultstyle" rel="stylesheet" type="text/css">
<style type="text/css">
body {
	background-color: #555555;
}
#infohdr {
	position: relative;
	margin-bottom: 8px;
}
#regtitle {
	position: absolute;
	left: 130px; top: 10px;
	font-size: 30px;
	color: #FFFFFF;
}
#center {
	position: absolute;
	width: 500px;
	margin-left: -250px;
	left: 50%;
	top: 10px;
}
h3 a {
	font-weight: bold;
}

p {
	margin-top: 0px; margin-bottom: 0px;
}

.fields {
	padding: 0; margin: 0px;
}
.line {
	margin: 4px;
	position: relative;
}
.line label {
	position: absolute;
	height: 20px;
	width: 150px;
	text-align: right;
	font-weight: bold;
}
.line .fd {
	display: inline;
	margin-left: 155px;
}

.nextarea {
	text-align: center;
}
.nextbutton {
	width: 300px;
}

/* validation */
.errorstyle {
	color: #FF0000 !important;
}
.errorstr {
	color: #FF0000;
	text-align: center;
	visibility: hidden;
	font-size: 80%;
	margin-bottom: -2px;
}
</style>

<script src="lib/jquery-1.3.js"></script>
<script src="lib/jquery.ui.all.js"></script>
<script src="js/Validator.js" language="javascript" type="text/javascript"></script>
<script language="javascript" type="text/javascript">
var valid;

$(document).ready(function() {
	$("#accordion").accordion({
		header: "h3"
	});
	
	valid = new Validator();
	valid.addField("f_password", "g_information", function(qel) {
		return (qel.attr("value").length > 0);
	});
	valid.addField("f_passwordconfirm", "g_information", function(qel) {
		return (qel.attr("value") == $("#f_password").attr("value"));
	});
	valid.addField("f_acceptdisclaimer", "g_disclaimer", function(qel) {
		return qel.attr("checked");
	});
	
	setupFields();
});

function setupFields() {
	$("#f_acceptdisclaimer").removeAttr("checked");
	$("#finalbutton").removeAttr("disabled");
}

function validateThenCreate() {
	valid.checkAll();
	var status = valid.getAllStatus();
	if (status) {
		$("#finalerror").css("visibility","hidden");
		$("#finalbutton").text("Creating Account...");
		$("#finalbutton").attr("disabled","disabled");
		
		//perform the post.
		//TODO: not very secure.
		$.post("<?php echo($_SERVER["PHP_SELF"]) ?>" + "?create=yes", 
		{
			"f_email": $("#f_email").attr("value"),
			"f_username": $("#f_username").attr("value"),
			"f_password": $("#f_password").attr("value"),
			"f_gradyear": $("#f_gradyear").attr("value")
		}, 
		function(data, status) {
			var res = data;
			
			$("#finalmessage").css("display", "block");
			$("#finalmessage").text(res.msg);
			
			if (res.success) {
				$("#successmessage").css("display", "block");
			} else {
				$("#finalbutton").text("Create Account");
				$("#finalbutton").removeAttr("disabled");
			}
		},"json");
	} else {
		$("#finalerror").css("visibility","visible");
	}
};

function test() {
	return false;
}
</script>
</head>

<body>
	
<div id="center">
	<div id="infohdr">
		<img id="logo" src="img/halplogo_small.png" alt=""/>
		<div id="regtitle">
			Account Creation
		</div>
	</div>
		
	<div id="accordion">
		<div>
			<h3><a id="g_information" href="#">Your Information</a></h3>
			<div>
				<div class="fields">
					<div class="line">
						<label for="f_email">Email</label>
						<div class="fd"><?php echo $addr; ?><input id="f_email" type="hidden" value="<?php echo $addr; ?>"/></div>
						<div class="errorstr" id="f_email_error">&nbsp;</div>
					</div>
					<div class="line">
						<label for="f_username">Username</label>
						<div class="fd"><?php echo $def_uname; ?><input id="f_username" type="hidden" value="<?php echo $def_uname; ?>"/></div>
						<div class="errorstr" id="f_username_error">&nbsp;</div>
					</div>
					<div class="line">
						<label for="f_password">Password</label>
						<div class="fd"><input id="f_password" type="password" style="width:200px;" onkeyup="valid.check(this); valid.check($('#f_passwordconfirm').get(0))" /></div>
						<div style="font-size: 80%; text-align: center">Your password is stored in plaintext; please do not use a valuable one.</div>
						<div class="errorstr" id="f_password_error">You must enter a password</div>
					</div>
					<div class="line">
						<label for="f_passwordconfirm">Confirm Password</label>
						<div class="fd"><input id="f_passwordconfirm" type="password" style="width:200px;" onkeyup="valid.check(this)" /></div>
						<div class="errorstr" id="f_passwordconfirm_error">Your password must match</div>
					</div>
					<div class="line">
						<label for="f_gradyear">Graduation Year</label>
						<div class="fd"><select id="f_gradyear" style="width:100px;">
						<?php
						//generate the list of graduation years
						for ($x = 0; $x < 5; ++$x) {
							$year = $GRAD_YEARS_START + $x;
							echo "<option value='$year'>$year</option>";
						}
						?>	
						</select></div>
						<div class="errorstr" id="f_gradyear_error">&nbsp;</div>
					</div>
				</div> <!-- /fields -->
				
				<div class="nextarea">
					<button class="nextbutton" onclick="$('#accordion').accordion('activate',1)">Next</button>
				</div>
			</div>
		</div>
		
		<div>
			<h3><a id="g_disclaimer" href="#">Disclaimer</a></h3>
			<div>
				<p>HALP is not a graduation audit - it is a tool to help you and your advisor plan your schedule.</p>
				<p>HALP validates only ECE, ME, and Systems major requirements, and will not check your AHS or E! requirements.</p>
				<p>Though your information is nominally linked to your account, it is not well-protected.</p>
				<p>To help make the tool become useful, please report issues you see!</p>
				
				<div class="fields">
					<div class="line">
						<label for="f_acceptdisclaimer">Accept</label>
						<div class="fd"><input id="f_acceptdisclaimer" type="checkbox" onclick="valid.check(this)" />I understand.</div>
						<div class="errorstr" id="f_acceptdisclaimer_error">You must succumb!</div>
					</div>
				</div>				
				
				<div class="nextarea">
					<button class="nextbutton" onclick="$('#accordion').accordion('activate',2)">Next</button>
				</div>
			</div>
		</div>
		
		<div>
			<h3><a href="#">Let's Go!</a></h3>
			<div>
				<p>Thanks - if everything above is okay, click the button below to create your account and continue to HALP.</p>
				<div class="errorstr" id="finalerror">
					Sorry, but it looks like there are some errors with your information. Please check the red-highlighted sections.<br>
				</div>
				
				<div class="nextarea" style="margin-bottom: 15px;">
					<button class="nextbutton" id="finalbutton" onclick="validateThenCreate()">Create Account</button>
				</div>
				
				<p id="finalmessage" style="display:none;">
					Account created successfully!	
				</p>
				<p id="successmessage" style="display:none;">
					You may click <a href="index.html" target="_blank">here</a> to continue and log in to HALP.
				</p>
			</div>
		</div>
		
	</div> <!-- /accordion -->
	
</div>
	
</body>
</html>