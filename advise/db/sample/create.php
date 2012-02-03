<?php
chdir("..");
//destroy the database
include 'connect.php';
$sql = "DROP DATABASE $dbname";
mysql_query($sql);
include 'close.php';

//... and recreate.
include 'create.php';
include 'connect.php';
chdir("sample");

//load the sample course data
mysql_query(file_get_contents("courses/courses.txt"));
//additions to the course list
mysql_query(file_get_contents("courses/Spring2009.txt"));
mysql_query(file_get_contents("courses/Fall2009.txt"));
mysql_query(file_get_contents("courses/xcourses.txt"));
mysql_query(file_get_contents("courses/offcampus.txt"));

//all courses were created by the "System" whenever this script is run
mysql_query("UPDATE `Courses` SET `SaveUser` = 'System'");
mysql_query("UPDATE `Courses` SET `SaveTime` = " . (time() * 1000));

//load the sample ruleset and list of majors
mysql_query(file_get_contents("rules.txt"));
mysql_query(file_get_contents("rulescategories.txt"));
mysql_query(file_get_contents("majors.txt"));

//load the sample users and their associated data.
mysql_query(file_get_contents("users.txt"));
mysql_query(file_get_contents("saves.txt"));

//load data for offerings
mysql_query(file_get_contents("offerings/Spring2009.txt"));

//mysql_query(file_get_contents("offerings/SupSpring2009.txt"));

include '../close.php';
?>