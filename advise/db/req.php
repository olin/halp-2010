<?php
include 'connect.php'; 

if (!$_GET["q"]) {
	error("Invalid database request");
}

switch ($_GET["q"]) {
	case "login": //requires POST username and password. Returns the user info
		$username = mysql_real_escape_string($_POST["username"]);
		$password = mysql_real_escape_string($_POST["password"]);
		$sql = "SELECT * FROM `Users` WHERE `Name` = '$username' AND `Password` = '$password'";
		$ret = getjson($sql);
		if ($ret != '[]') {
			//establish the session
			session_start();
			$_SESSION["username"] = $username;
		}
		echo $ret;
		break;
	case "forgotpass":
		$username = mysql_real_escape_string($_POST["username"]);
		$sql = "SELECT * FROM `Users` WHERE `Name` = '$username'";
		$result = mysql_query($sql);
		$numret = 0;
		$msg = "";
		while ($row = mysql_fetch_assoc($result)) {
			$mail_to = $row["Email"];
			$mail_pass = $row["Password"];
			$mail_body = "This is a message from HALP. \n" .
				"HALP got a password recovery request for your username. Your password is: \n" .
				$mail_pass . "\n" .
				"Sorry these passwords are insecure at the moment!";
			
			mail(
				$mail_to,
				"HALP Password",
				$mail_body,
				"From: HALP <ilari@students.olin.edu>"
			);
			$msg = "Email sent to " . $mail_to;
			
			++$numret;
			break;
		}
		if ($numret == 0) {
			$msg = "Error: user not found.";
		}
		mysql_free_result($result);
		echo json_encode($msg);
		break;
	case "load": //uses the session username
		session_start(); //required to resume the session
		$user = $_SESSION["username"];
		$sql = "SELECT * FROM `Saves` WHERE `Name` = '$user'";
		echo getjson($sql);
		break;
	case "getcourses":
		$sql = "SELECT `Code` , `Nickname`, `Title` , `Instructors` , `Credits` , `Hours` , `Corequisites` , `Prerequisites` , `Offered` FROM `Courses`";
		echo getjson($sql);
		break;
		
	case "getcoursesources": //get a list of course sources
		$sql = "SELECT DISTINCT `Source` FROM `Courses`";
		echo getjson($sql);
		break;
	case "getcourseeditlist": //get a list of courses for the specified source
		$source = mysql_real_escape_string($_GET["source"]);
		$sql = "SELECT `Code`, `Nickname` FROM `Courses` WHERE `Source` = '$source' ORDER BY `Code`";
		echo getjson($sql);
		break;
	case "getrevisions": //return a revision list for the specified course code
		$coursecode = mysql_real_escape_string($_GET["code"]);
		$source = mysql_real_escape_string($_GET["source"]);
		$sql = "(SELECT `SaveTime`, `SaveUser` FROM `Courses` WHERE `Source` = '$source' AND `Code` = '$coursecode')"
			. " UNION "
			. "(SELECT `SaveTime`, `SaveUser` FROM `CourseArchives` WHERE `Source` = '$source' AND `Code` = '$coursecode')"
			. " ORDER BY `SaveTime` DESC";
		echo getjson($sql);
		break;
	case "getcourse": //return a single course from the database
		$coursecode = mysql_real_escape_string($_GET["code"]);
		$source = mysql_real_escape_string($_GET["source"]);
		$sql = "SELECT * FROM `Courses` WHERE `Source` = '$source' AND `Code` = '$coursecode'";
		echo getjson($sql);
		break;
	case "getrevision": //return a course from the revision list
		$coursecode = mysql_real_escape_string($_GET["code"]);
		$savetime = mysql_real_escape_string($_GET["savetime"]);
		$source = mysql_real_escape_string($_GET["source"]);
		$sql = "SELECT * FROM `CourseArchives` WHERE `Source` = '$source' AND `SaveTime` = $savetime AND `Code` = '$coursecode'";
		echo getjson($sql);
		break;
	case "makerevision": //make a revision to the specified course
		//copy to the archive table
		$code = mysql_real_escape_string($_POST["Code"]);
		$source = mysql_real_escape_string($_POST["Source"]);
		$sql = "INSERT INTO `CourseArchives` SELECT * FROM `Courses` WHERE `Source` = '$source' AND `Code` = '$code'";
		mysql_query($sql);
		
		$sql = "UPDATE `Courses` SET ";
		//the fields we'll need to update
		$fields = array(
			'SaveUser',
			'SaveTime',
			'Source',	
			'Code',
			'Title',
			'Nickname',
			'Instructors',
			'Credits',
			'Hours',
			'Corequisites',
			'Prerequisites',
			'Offered',
			'Description');
		foreach ($fields as $field) {
			$val = mysql_real_escape_string($_POST[$field]);
			$sql = $sql . "`$field` = '$val', ";
		}
		//get rid of the trailing comma
		$sql = substr($sql, 0, strlen($sql) - 2) . " ";
		$sql = $sql . "WHERE `Source` = '$source' AND `Code` = '$code'";
		mysql_query($sql);
		break;
	case "revertto": //revert to the specified revision
		$code = mysql_real_escape_string($_POST["Code"]);
		$source = mysql_real_escape_string($_POST["Source"]);
		$savetime = mysql_real_escape_string($_POST["SaveTime"]);
		$newuser = mysql_real_escape_string($_POST["NewUser"]);
		//remove all newer revisions from course archives
		$sql = "DELETE FROM `CourseArchives` WHERE `SaveTime` > $savetime AND `Source` = '$source' AND `Code` = '$code'";
		mysql_query($sql);
		//remove from the current course list
		$sql = "DELETE FROM `Courses` WHERE `Source` = '$source' AND `Code` = '$code'";
		mysql_query($sql);
		//move the specified revision from the archives to the list
		$sql = "INSERT INTO `Courses` SELECT * FROM `CourseArchives` WHERE `SaveTime` = $savetime AND `Source` = '$source' AND `Code` = '$code'";
		mysql_query($sql);
		//remove from the archives
		$sql = "DELETE FROM `CourseArchives` WHERE `SaveTime` = $savetime AND `Source` = '$source' AND `Code` = '$code'";
		mysql_query($sql);
		//set the revision author
		$sql = "UPDATE `Courses` SET `SaveUser` = '$newuser' WHERE `Source` = '$source' AND `Code` = '$code'";
		mysql_query($sql);
		break;
	case "newcourse":
		$code = mysql_real_escape_string($_POST["Code"]);
		$nickname = mysql_real_escape_string($_POST["Nickname"]);
		$source = mysql_real_escape_string($_POST["Source"]);
		$user = mysql_real_escape_string($_POST["User"]);
		$savetime = mysql_real_escape_string($_POST["SaveTime"]);
		$sql = "INSERT INTO `Courses` (`SaveUser`, `SaveTime`, `Source`, `Code`, `Nickname`)"
			. " VALUES ('$user',$savetime,'$source','$code','$nickname')";
		mysql_query($sql);
		break;
				
	case "getdesc":
		$coursecode = mysql_real_escape_string($_GET["code"]);
		$sql = "SELECT `Description` FROM `Courses` WHERE `Code` = '$coursecode'";
		echo getjson($sql);
		break;
	case "getrules":
		$sql = "SELECT * FROM `Rules`";
		echo getjson($sql);
		break;
	case "getrulescategories":
		$sql = "SELECT * FROM `RulesCategories`";
		echo getjson($sql);
		break;
	case "getmajors":
		$sql = "SELECT * FROM `Majors`";
		echo getjson($sql);
		break;
	case "setmajor":
		session_start();
		$major = mysql_real_escape_string($_POST["major"]);
		$user = $_SESSION["username"];
		$sql = "UPDATE `Users` SET `Major` = '$major' WHERE `Name` = '$user'";
		mysql_query($sql);
		break;
	case "setsemesters":
		session_start();
		$semesters = mysql_real_escape_string($_POST["semesters"]);
		$user = $_SESSION["username"];
		$sql = "UPDATE `Users` SET `Semesters` = '$semesters' WHERE `Name` = '$user'";
		mysql_query($sql);
		break;
	case "save":
		session_start();
		$data = stripslashes(mysql_real_escape_string($_POST["data"]));
		$major = mysql_real_escape_string($_POST["major"]);
		$user = $_SESSION["username"];
		$sql = "UPDATE `Saves` SET `Data` = '$data', `Major` = '$major' WHERE `Name` = '$user'";
		mysql_query($sql);
		break;
	//get the list of semester indices
	case "getofferingsems":
		$sql = "SELECT DISTINCT Semester FROM Offerings";
		echo getjson($sql);
		break;
	case "getofferings":
		break;
}

include 'close.php';
?>