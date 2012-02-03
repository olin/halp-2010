<?php
include 'connect.php';

if ($DB_EXISTS) {
	error("Database already exists");
}
$sql  = "CREATE DATABASE $dbname";
$result = mysql_query($sql);
mysql_select_db($dbname);

$sql = 'CREATE TABLE `Courses` ('
		. ' `SaveUser` VARCHAR (100) NOT NULL, '
		. ' `SaveTime` BIGINT NOT NULL, '
		. ' `Source` VARCHAR(50) NOT NULL, '
		. ' `Code` VARCHAR(20) NOT NULL, '
		. ' `Title` VARCHAR(200) NOT NULL, '
		. ' `Nickname` VARCHAR(200) NOT NULL, '
		. ' `Instructors` VARCHAR(200) NOT NULL, '
		. ' `Credits` VARCHAR(200) NOT NULL, '
		. ' `Hours` VARCHAR(10) NOT NULL, '
		. ' `Corequisites` VARCHAR(200) NOT NULL, '
		. ' `Prerequisites` VARCHAR(200) NOT NULL, '
		. ' `Offered` VARCHAR(100) NOT NULL, '
		. ' `Description` TEXT NOT NULL'
		. ' )';
$result = mysql_query($sql);

//the CourseArchives table should have the same format as the Courses table
$sql = str_replace('`Courses`', '`CourseArchives`', $sql);
$result = mysql_query($sql);

$sql = 'CREATE TABLE `Rules` ('
		. ' `Name` VARCHAR(200) NOT NULL, '	
		. ' `Category` VARCHAR(200) NOT NULL, '
		. ' `Searcher` TEXT NOT NULL, '
		. ' `Code` TEXT NOT NULL '
		. ' )';
$result = mysql_query($sql);

$sql = 'CREATE TABLE `RulesCategories` ('
		. ' `Category` VARCHAR(200) NOT NULL, '	
		. ' `ShortCategory` VARCHAR(200) NOT NULL, '
		. ' `Color` VARCHAR(200) NOT NULL '
		. ' )';
$result = mysql_query($sql);

$sql = 'CREATE TABLE `Users` ('
		. ' `Name` VARCHAR(200) NOT NULL, '
		. ' `Password` VARCHAR(200) NOT NULL, '
		. ' `Email` VARCHAR(200) NOT NULL, '
		. ' `Major` VARCHAR(20) NOT NULL, '
		. ' `Semesters` VARCHAR(200) NOT NULL '
		. ' ) ';
$result = mysql_query($sql);

$sql = 'CREATE TABLE `Saves` ('
		. ' `Name` VARCHAR(200) NOT NULL, '
		. ' `Major` VARCHAR(200) NOT NULL, '
		. ' `Data` TEXT NOT NULL '
		. ' ) ';
$result = mysql_query($sql);

$sql = 'CREATE TABLE `Majors` ('
		. ' `Code` VARCHAR(20) NOT NULL, '
		. ' `Name` VARCHAR(200) NOT NULL '
		. ' ) ';
$result = mysql_query($sql);

$sql = 'CREATE TABLE `offerings` ('
		. '`Semester` varchar(4) NOT NULL, '
		. '`Area` varchar(10) NOT NULL, '
		. '`Code` varchar(10) NOT NULL, '
		. '`Section` varchar(4) NOT NULL, '
		. '`Title` varchar(200) NOT NULL, '
		. '`Instructors` varchar(200) NOT NULL, '
		. '`Credits` varchar(20) NOT NULL, '
		. '`Time` varchar(20) NOT NULL, '
		. '`Location` varchar(100) NOT NULL, '
		. '`EnrollLimit` varchar(10) NOT NULL, '
		. '`Note` varchar(200) NOT NULL '
		. ' ) ';
$result = mysql_query($sql);

include 'close.php';
?>