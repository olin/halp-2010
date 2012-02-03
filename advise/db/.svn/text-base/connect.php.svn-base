<?php
include_once 'util.php';

$conn = mysql_connect($dbhost, $dbuser, $dbpass) or error("Could not connect to database");

//make sure database exists
$result = mysql_query("show databases like '$dbname'");
$cnt = 0;
while ($row = mysql_fetch_row($result)) {
	++$cnt;
}
$DB_EXISTS = ($cnt == 1);

//only connect if the database exists
if ($DB_EXISTS) {
	mysql_select_db($dbname);
} else {
	warn("Could not open database - may not be created yet.");
}
?>
