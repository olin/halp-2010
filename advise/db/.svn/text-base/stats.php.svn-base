<?php
include 'connect.php';

//map from username to semesters
$usersems = array();
$sql = "SELECT * FROM `users`";
$res = mysql_query($sql);
while ($row = mysql_fetch_assoc($res)) {
	$usersems[$row["Name"]] = json_decode($row["Semesters"]);
}
mysql_free_result($res);
//print_r($usersems);

//semester data
$sdata = array();

$sql = "SELECT * FROM `saves`";
$res = mysql_query($sql);
while ($row = mysql_fetch_assoc($res)) {
	$username = $row["Name"];
	$sems = $usersems[$username];
	$cdata = json_decode($row["Data"]);
	
	//look through the user's courses
	foreach ($cdata as $n => $courses) {
		//n is the semester index, and $sems[$n] is the actual number
		$sdx = $sems[$n];
		
		//stuff each course in the master index
		foreach ($courses as $course) {
			//make a new list for this semester if necessary.
			if (!isset($sdata[$sdx])) {
				$sdata[$sdx] = array();
			}
			
			//build the histogram
			$curd = $sdata[$sdx];
			if (!isset($curd[$course])) {
				$curd[$course] = 1;
			} else {
				$curd[$course] += 1;
			}
			$sdata[$sdx] = $curd;
		}
	}
	
	//print_r($cdata);
}
mysql_free_result($res);

print_r($sdata);

include 'close.php';
?>