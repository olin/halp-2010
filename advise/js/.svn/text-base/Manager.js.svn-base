/**
@namespace Creates and operates the course manager ContentPane
*/
var Manager = {	
};

/**
Course sources - catalogs or user-compiled lists
*/
Manager.sources = null;

/**
AJAX-load the resources required for the course manager
@param fn continuation function to use	
*/
Manager.init = function(/**Function*/ fn) {
	if (Manager.initialized) {
		fn();
	}
	
	$.getJSON("db/req.php?q=getcoursesources", {rstr: Utils.rstr()},
	 function(data) {
		//store the categories
		Manager.sources = [];
		for (var x = 0; x < data.length; ++x) {
			Manager.sources.push(data[x]["Source"]);
		}
		
		Manager.createSourceList($("#manage_sourcesel"));
		
		Manager.initialized = true;
	});
};

/**
Insert the list of sources into the given UI element
@param elm the select box to use
*/
Manager.createSourceList = function(/**jquery*/ elm) {
	//insert the source options
	for (var x = 0; x < this.sources.length; ++x) {
		var source = this.sources[x];
		elm.append($("<option></option>")
			.attr("value",source)
			.html(source)
		);
	}
	//create the list
	this.selectSource($("#manage_sourcesel").get(0));
};

/**
Callback for adding a new course in the management interface
*/
Manager.addNewCourse = function() {
	$.prompt(
		"<b>Please enter the new course information:</b><br>" +
		"<div class='addnewinfo'>Code:</div><input id='manage_addcode' type='text'><br>" +
		"<div class='addnewinfo'>Nickname:</div><input id='manage_addnickname' type='text'><br>",
		{ 
			buttons: { "OK": true, "Cancel": false },
			callback: function(v, m) {
				var newcode = m.find("#manage_addcode").attr("value");
				var newsource = Manager.getSource();
				//the value is only true if the user has clicked yes
				if (v) {
					$.post("db/req.php?q=newcourse", {
						"Code": newcode,
						"Nickname": m.find("#manage_addnickname").attr("value"),
						"Source": newsource,
						"User": curuser.username,
						"SaveTime": (new Date()).getTime()
					}, function(text) {
						//refresh the list
						Manager.selectSource($("#manage_sourcesel").get(0));
						
						Manager.updateLocalCourses(newsource, newcode);
					}, "text");
				}
			}
		}
		);
};

/**
Synchronize the local courses list with an update for the course with the given source and title
*/
Manager.updateLocalCourses = function(/**String*/ newsource, /**String*/ newcode) {
	//load the recently-saved course
	$.getJSON("db/req.php?q=getcourse", 
		{source: newsource, code: newcode, rstr: Utils.rstr()},
		function(data) {
			var course = data[0];
			
			//load the new course into the main interface
			Store.loadCourse(course);
		});	
};

/**
@return the current course source (catalog, etc.)
*/
Manager.getSource = function() {
	return Manager.cursource;
};

/**
Loads the course list, as given by the current selection option
@param elm the select box to use as the selection source
*/
Manager.selectSource = function(/**Element*/ elm) {
	var sourcev = $(elm).attr("value");
	Manager.cursource = sourcev;

	var insertlst = $("#manage_courseinsert");
	
	//clear and display the loading information
	insertlst.empty();
	var intr;
	insertlst.append(
		intr = $("<tr></tr>")
	);
	intr.append(
		$("<td></td>")
			.attr("colspan", 2)
			.text("Loading...")	
	);
	
	$.getJSON("db/req.php?q=getcourseeditlist", {source: sourcev}, function(data) {
		var insertlst = $("#manage_courseinsert");
		var intr;
		
		insertlst.empty();
		
		for (var x = 0; x < data.length; ++x) {
			var course = data[x];
			//do the insert of the course list
			insertlst.append(
				intr = $("<tr onclick='Manager.selectCourse(this)'></tr>")
					.data("Code", course["Code"])
			);
			intr.append(
				$("<td></td>").html(course["Code"].replace(/\ /ig, "&nbsp;"))
			);
			intr.append(
				$("<td></td>").html(course["Nickname"])
			);
		}
	});

	//$("#manage_courseinsert")
};

/**
Callback for selecting a course from the edit list on the left pane of the management interface
@param elm the clicked table row element
*/
Manager.selectCourse = function(/**Element*/ elm) {
	var qel = $(elm);
	
	//dehighlight any previously selected course
	$(".courseeditlist tbody tr.selected").each(function(i, el) {
		$(el).removeClass("selected");
	});
	qel.addClass("selected");
	
	//load the course editor interface
	this.CourseEditor.init();
	
	//load the revisions list
	$.getJSON("db/req.php?q=getrevisions", 
		{source: Manager.getSource(), code: qel.data("Code"), rstr: Utils.rstr()}, 
		function(data) {
			var revs = data;
			
			var intr;
			var insertlst = $("#manage_revisionsinsert");
			insertlst.empty();
			
			//insert each revision into the table
			for (var x = 0; x < revs.length; ++x) {
				var rev = revs[x];
				insertlst.append(
					intr = $("<tr onclick='Manager.selectRevision(this)'></tr>")
						.data("Code", qel.data("Code"))
						.data("SaveTime", rev["SaveTime"])
						.data("Current", (x == 0))
					);
					
					var dat = new Date();
					dat.setTime(rev["SaveTime"]);
					intr.append(
						$("<td></td>").html(dat.toDateString())
					);
					intr.append(
						$("<td></td>").html(rev["SaveUser"])
					);
					
				if (x == 0) {
					Manager.selectRevision(intr);
				}
			}
		}
	);
};

/**
Callback for selecting a revision from the revisions list
@param elm the clicked table row element
*/
Manager.selectRevision = function(/**Element*/ elm) {
	var qel = $(elm);

	//dehighlight any previously selected revision
	$(".revisionslist tbody tr.selected").each(function(i, el) {
		$(el).removeClass("selected");
	});
	qel.addClass("selected");

	if (qel.data("Current")) {
		//if it's current, load the associated course
		$.getJSON("db/req.php?q=getcourse", 
			{source: Manager.getSource(), code: qel.data("Code"), rstr: Utils.rstr()}, 
			function(data) {
				var course = data[0];
				Manager.CourseEditor.setFields(course);
				Manager.CourseEditor.setEditability(Manager.CourseEditor.EDIT_EXISTING);
				Manager.CourseEditor.setAction(
					Manager.CourseEditor.ACTION_SAVE_REVISION,
					{
						Source: Manager.getSource(),
						Code: qel.data("Code")
					}
					);
			}
		);	
	} else {
		//otherwise, load the revision
		$.getJSON("db/req.php?q=getrevision", 
			{source: Manager.getSource(), code: qel.data("Code"), savetime: qel.data("SaveTime"), rstr: Utils.rstr()}, 
			function(data) {
				var course = data[0];
				Manager.CourseEditor.setFields(course);
				Manager.CourseEditor.setEditability(Manager.CourseEditor.EDIT_NONE);
				Manager.CourseEditor.setAction(
					Manager.CourseEditor.ACTION_REVERT_TO,
					{
						Source: Manager.getSource(),
						Code: qel.data("Code"),
						SaveTime: qel.data("SaveTime")
					}
					);
			}
		);	
	}
};

/**
@namespace Used for editing course details
*/
Manager.CourseEditor = {	
};

/**
Create the course editor area and insert it into the document
*/
Manager.CourseEditor.init = function() {
	if (!this.initialized) {		
		var cont = $("<div>")
			.css({
				"float":"left"
			});
		
		var de = Manager.DataEditor;
		this.editors = [
			new de("Code", de.SINGLETEXT, false),
			new de("Nickname", de.SINGLETEXT, false),
			new de("Title", de.SINGLETEXT, true),
			new de("Instructors", de.SINGLETEXT, true),
			new de("Credits", de.SINGLETEXT, true),
			new de("Hours", de.SINGLETEXT, true),
			new de("Corequisites", de.SINGLETEXT, true),
			new de("Prerequisites", de.SINGLETEXT, true),
			new de("Offered", de.SINGLETEXT, true),
			new de("Description", de.MULTITEXT, true)
		];

		for (var x = 0; x < this.editors.length; ++x) {
			this.editors[x].appendTo(cont);
		}

		this.buttonholder = $("<div>")
			.css({
				"text-align":"center",
				"clear":"both"
			})
			.appendTo(cont);
			
		this.button = $("<button></button>")
			.addClass("dataeditorbutton")
			.text("<no action specified>")
			.click(this.doAction)
			.appendTo(this.buttonholder);

		cont.appendTo($("#manage_editarea"));
		
		//show the revisions and selected course area, and hide the welcome message
		$("#manage_revisionarea").css("display","block");
		$("#manage_intromessage").css("display","none");
		
		this.initialized = true;
	}	
};

/**
Enable all fields for editing
*/
Manager.CourseEditor.EDIT_ALL = 1;
/**
Enable all but Code and Nickname
*/
Manager.CourseEditor.EDIT_EXISTING = 2;
/**
Disable all fields
*/
Manager.CourseEditor.EDIT_NONE = 4;

/**
Set the course editor to have the given edit possibilities
*/
Manager.CourseEditor.setEditability = function(/**int*/ status) {
	var edit = [];
	switch (status) {
		case Manager.CourseEditor.EDIT_ALL:
			edit = [true, true, true, true, true, true, true, true, true, true];
			break;
		case Manager.CourseEditor.EDIT_EXISTING:
			edit = [false, false, true, true, true, true, true, true, true, true];
			break;
		case Manager.CourseEditor.EDIT_NONE:
			edit = [false, false, false, false, false, false, false, false, false, false];
			break;
		default:
			error("Invalid CourseEditor edit state: " + status);
			break;
	}
	
	for (var x = 0; x < this.editors.length; ++x) {
		this.editors[x].setEditable(edit[x]);
	}
};

/**
Set the fields of the course editor area to the content of the given course
*/
Manager.CourseEditor.setFields = function(/**Course*/ course) {
	for (var x = 0; x < this.editors.length; ++x) {
		//lookup the field in the course
		var editor = this.editors[x];
		editor.setText(course[editor.name]);
	}
};

/**
Save a new revision
*/
Manager.CourseEditor.ACTION_SAVE_REVISION = 1;
/**
Revert to the selected revision
*/
Manager.CourseEditor.ACTION_REVERT_TO = 2;

/**
Set the action of the editor button
@param action one of ACTION_SAVE_REVISION or ACTION_REVERT_TO
@param properties the necessary database parameters for the action
*/
Manager.CourseEditor.setAction = function(/**int*/ action, /**dict*/ properties) {
	Manager.CourseEditor.action = [action, properties];
	
	switch (action) {
		case Manager.CourseEditor.ACTION_SAVE_REVISION:
			this.button.text("Save New Revision");
			break;
		case Manager.CourseEditor.ACTION_REVERT_TO:
			this.button.text("Revert To This Revision");
			break;
		default:
			error("Invalid CourseEditor button action: " + action);
			break;
	}
};

Manager.CourseEditor.doAction = function() {
	var action = Manager.CourseEditor.action[0];
	var props = Manager.CourseEditor.action[1];
	var editors = Manager.CourseEditor.editors;
	
	switch (action) {
		case Manager.CourseEditor.ACTION_SAVE_REVISION:
			var dct = {};
			//load up k/v pairs
			for (var x = 0; x < editors.length; ++x) {
				dct[editors[x].name] = editors[x].getText();
			}
			dct["Source"] = props["Source"];
			dct["SaveUser"] = curuser.username;
			dct["SaveTime"] = (new Date()).getTime();
			
			$.post("db/req.php?q=makerevision", dct, function(text) {
				//reload the course
				Manager.selectCourse($(".courseeditlist tbody tr.selected").get(0));
				Manager.updateLocalCourses(dct["Source"], dct["Code"]);
			}, "text");
			break;
		case Manager.CourseEditor.ACTION_REVERT_TO:
			$.prompt(
				"<b>Are you sure you would like to revert to this revision?</b><br>" +
				"This action cannot be undone, and will affect all users. You will be listed as the revision author.",
				{ 
					buttons: { Yes: true, No: false },
					callback: function(v, m) {
						//the value is only true if the user has clicked yes
						if (v) {
							//should have Source, Code, and SaveTime
							var dct = props;
							dct["NewUser"] = curuser.username;

							$.post("db/req.php?q=revertto", dct, function(text) {
								//reload the course	
								Manager.selectCourse($(".courseeditlist tbody tr.selected").get(0));
								Manager.updateLocalCourses(dct["Source"], dct["Code"]);
							});
						}
					}
				}
				);
			break;
	}
};

/**
@class Creates an editor for a piece of data
*/
Manager.DataEditor = function(/**String*/ name, /**int*/ type, /**Boolean*/ editable) {
	this.name = name;
	
	this.mainbox = $("<div>")
		.addClass("dataeditor");
		
	this.descbox = $("<div>")
		.text(name)
		.addClass("datadesc")
		.appendTo(this.mainbox);
		
	this.editimg = $("<img>")
		.css("float","left")
		.attr("alt","editable")
		.appendTo(this.mainbox);
		
	switch (type) {
		case Manager.DataEditor.SINGLETEXT:
			this.field = $("<input type='text'>");
			break;
		case Manager.DataEditor.MULTITEXT:
			this.field = $("<textarea></textarea>");
			break;
		default:
			this.field = $("<div>")
				.text("Invalid data editor type: " + type);
	}

	this.setEditable(editable);
	
	this.field.appendTo(this.mainbox);
};

/**
Make the editor area enabled or disabled
@param editable should it be enabled or disabled?
*/
Manager.DataEditor.prototype.setEditable = function(/**Boolean*/ editable) {
	if (editable) {
		this.field.removeAttr("readonly");
		this.editimg.attr("src", "img/application_form_edit.png");
	} else {
		this.field.attr("readonly","readonly");
		this.editimg.attr("src", "img/application_form_edit_cross.png");
	}
};

/**
Creates a single-line text editor
*/
Manager.DataEditor.SINGLETEXT = 1;

/**
Creates a multi-line text editor
*/
Manager.DataEditor.MULTITEXT = 2;

/**
Append this DataEditor to the given jquery element
@param jqel the element to append to 
*/
Manager.DataEditor.prototype.appendTo = function(/**jquery*/ jqel) {
	this.mainbox.appendTo(jqel);	
};

/**
Set the text in this DataEditor to the given string
@param text the text to set
*/
Manager.DataEditor.prototype.setText = function(/**String*/ text) {
	this.field.attr("value", text);	
};

/**
@return the current text value of the editor
*/
Manager.DataEditor.prototype.getText = function() {
	return this.field.attr("value");	
};