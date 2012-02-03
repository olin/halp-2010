<?php
include("lib/JSON.php");

$dbhost = "localhost";
$dbuser = "advising";
$dbpass = "advising";
$dbname = "advising";

function error($str) {
	die("ERROR: " . $str);
}
function warn($str) {
	echo("WARNING: " . $str);
}

function getjson($sql) {
	$retarr = array();
	$result = mysql_query($sql);
	while ($row = mysql_fetch_assoc($result)) {
		array_push($retarr, $row);
	}
	mysql_free_result($result);
	return json_encode($retarr);
}
?>