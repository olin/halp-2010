/**
@namespace Images and icons for the user interface
*/
var Images = {
};

/**
complete (checkmark)
*/
Images.R_COMPLETE = 1;
/**
warning (yellow exclamation)
*/
Images.R_WARNING = 2;
/**
unknown (question mark)
*/
Images.R_UNKNOWN = 3;
/**
error (red exclamation)
*/
Images.R_ERROR = 4;

/**
@return the path to the image icon that corresponds to the given R code
*/
Images.forCode = function(/**int*/ rcode) {
	switch (rcode) {
	case Images.R_COMPLETE: //complete
		imgsrc = "img/accept.png"; break;
	case Images.R_WARNING: //warning
		imgsrc = "img/error.png"; break;
	case Images.R_UNKNOWN: //unknown
		imgsrc = "img/help.png"; break;
	case Images.R_ERROR: //error
		imgsrc = "img/exclamation.png"; break;
	}
	return imgsrc;
}