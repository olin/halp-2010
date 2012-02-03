/**
@class Used for managing the content of the center pane "window"
*/
function ContentPane(name) {
	this.name = name;
	ContentPane.panes[name] = this;
}

/**
A list of all content panes currently created
*/
ContentPane.panes = {};

/**
Switch to the content pane with the given name
*/
ContentPane.switchTo = function(/**String*/ name) {	
	var newpane;
	for (pane in this.panes) {
		if (pane == name) {
			newpane = this.panes[name];
			if (!newpane.initialized) {
				newpane.initialized = true;
				newpane.init();
			}
			newpane.activate();
			this.curpane = newpane;
		} else {
			if (this.panes[pane].initialized) {
				this.panes[pane].deactivate();
			}
		}
	}
}

/**
The currently active content pane
*/
ContentPane.curpane = null;

/**
@return currently active content pane
*/
ContentPane.cur = function() {
	return ContentPane.curpane;
}

/**
The "Long-Term Plan" pane
*/
var schedPane = new ContentPane("longtermplan");
schedPane.init = function() {
	//alert("InitSchedPane");
	
	//size the layout
	if (pageLayout) {
		pageLayout.sizePane("south", 200);
		pageLayout.sizePane("east", 300);
	}
};
schedPane.activate = function() {
	//alert("ActivateSchedPane");
	
	pageLayout.open("south");
	pageLayout.open("east");
	
	this.resize();
	
	//HACK: it seems the close call doesn't create the layout fully
	setTimeout(this.resize, 1000);
};
schedPane.deactivate = function() {
	//alert("DeactivateSchedPane");
};
schedPane.resize = function() {
	//salert("ResizeSchedPane");
	var centerel = $("div.ui-layout-center");
	var height = centerel.height();
	var width = centerel.width();

	//set the credit width to something that will
	//	roughly take up the width of the screen
	Ticks.credw = Math.floor((width - 120) / Ticks.MAXCREDITS);
	
	//change the vertical size of everything
	SEMHEIGHT = Math.floor((height - (20+20)) / Ticks.NUMSEMS) - 4;
	Ticks.resize();
	
	//resize all the semester blocks
	$(".semdesc").each(function(i,el) {
		$(el).css("height", SEMHEIGHT + "px");
	});
	$("#semesters").css("padding-bottom",SEMHEIGHT+"px");

	//resize all the course blocks
	$(".course").each(function(i,el) {
		var qel = $(el); 
		qel.css({
			"width": Ticks.credw*qel.data("numcredits") + "px",
			"height": SEMHEIGHT + "px"
		});
	});
	
	//repack the course divs in each semester
	for (var sem = 0; sem < Ticks.NUMSEMS; ++sem) {
		Schedule.repackDivs(sem);	
	}
	
	resizeRules();
};

/**
The "Manage Courses" pane
*/
var managePane = new ContentPane("managecourses");
managePane.init = function() {
	//alert("InitManagePane");
	
	Manager.init();
	
	//HACK: I have absolutely no idea why we have to hide the div when performing layout
	$("#cnt_managecourses").css("display","none");
	
	this.manageLayout = $("#cnt_managecourses").layout({
		north: {
			resizable: false,
			closable: false,
			minSize: 25,
			maxSize: 25,
			spacing_open: 0,
			paneSelector: ".manage-north"	
		},
		west: {
			paneSelector: ".manage-west",
			onresize: function() {
				//resize the course selection list to be the width of the pane
				var wel = $("div.manage-west");
				var SELECTHEIGHT = 25;
				$("#manage_sourcesel").css({
					"width":wel.width()+"px",
					"height":SELECTHEIGHT+"px"
				});
				$("#manage_courselist").css({
					"width":wel.width()+"px",
					"height":(wel.height()-SELECTHEIGHT-25)+"px"
				});
			}
		},
		center: {
			paneSelector: ".manage-center"
		}
	});
	
	$("#cnt_managecourses").css("display","block");

	//temporarily hide the revisions and selected course area
	$("#manage_revisionarea").css("display","none");
	

	this.manageLayout.resizeAll();
	this.manageLayout.sizePane("west", 200);
};
managePane.activate = function() {
	//alert("ActivateManagePane");
	pageLayout.close("south");
	pageLayout.close("east");
	
	this.manageLayout.resizeAll();
	
	//HACK: it seems the close call doesn't create the layout fully
	setTimeout(this.manageLayout.resizeAll, 1000);
};
managePane.deactivate = function() {
	//alert("DeactivateManagePane");
};
managePane.resize = function() {
	//alert("ResizeManagePane");
	
	//TODO: we need some sort of resize here - unfortunately, the layout doesn't respond (!)
};