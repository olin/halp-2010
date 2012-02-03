/**
@namespace General utility functions
*/
var Utils = {
};

/**
Output an error string to stdout
@param str the error string to output
*/
Utils.error = function(/**String*/ str) {
	console.log(str);
};

/**
Return the rgb(r, g, b) string from an array [r, g, b]
@param arr the [r g b] tuple to use.
*/
Utils.colorstr = function(/**Array*/ arr) {
	return "rgb(" + arr[0] + "," + arr[1] + "," + arr[2] + ")";
};

Utils.an = 0;
/**
Debugging in IE is a pain. Display an alert up to 5 times.
@param obj the object to display in the alert box
*/
Utils.alertn = function(/**Object*/ obj) {
	if (Utils.an < 5) {
		alert(obj);
	}
	++an;
};

/**
Return a psuedorandom string for tacking onto GET requests to make sure they're not cached
*/
Utils.rstr = function() {
	return (Math.random() + "").substring(4);
};

/**
Remove the element at the specified index from the array
@param idx the index to remove an element
*/
Array.prototype.remove = function(/**int*/ idx) {
	if (idx == 0) {
		return this.slice(1, this.length);
	} else if (idx == this.length - 1) {
		return this.slice(0, this.length-1);
	} else {
		return this.slice(0, idx).concat(this.slice(idx+1, this.length));
	}
};