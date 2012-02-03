/**
@namespace Callbacks for button actions on the main UI
*/
var Buttons = {	
};

/**
Callback for a click on one of the main tabs
@param obj the tab that was clicked
*/
Buttons.maintabClick = function(/**Element*/ obj) {
	var jqdiv = $(obj);
	
	//click on another tab
	if (!jqdiv.hasClass("down")) {
		//unhighlight the previous tab
		$(".maintab.down").removeClass("down");
		jqdiv.addClass("down");
		
		//hide all tabs
		$(".ui-layout-center").children().each(function(i, el) {
			$(el).css("display","none");
		});
		
		//show the relevant tab
		var name = jqdiv.attr("id").split("_")[1];
		$("#cnt_" + name).css({
			"display":"block"
		});
		
		ContentPane.switchTo(name);
	}
};

/**
Callback for "print" button on main UI
*/
Buttons.print = function() {
	$.post("db/print.php", 
		{
			"data":JSON.stringify(Store.printserialize()),
			"credits":JSON.stringify(Store.printcompletion()),
			"username":curuser.getName()
		},
		function(text) {
			//splat the returned text into the dialog
			var del = $("#dialog");
			del.attr("title","Print Status");
			del.empty();
			var dtxt = $("<div style='font-size:110%;'></div>")
				.html(text);
			var expltxt = $("<div></div>")
				.text("Click the link above to download or print your plan.");
			del.append(dtxt);
			del.append(expltxt);
			
			//show the dialog
			del.dialog({ 
				buttons: { 
					"Ok": function() { 
						$(this).dialog("close"); 
					} 
				},
				autoOpen: false
			});
			del.dialog("open");
		}, "text");
};

/**
Callback for "save" button on main UI
*/
Buttons.save = function() {
	var serialized = Store.serialize();
	currentlySaving = serialized;
	Login.ensureLogin(function() {
		//save the schedule
		$.post("db/req.php?q=save", 
			{
				"data":JSON.stringify(serialized),
				"major":Schedule.getMajor()
			},
			function(data) {
				//ignore data sent back from the server
			}, "text");
		
		//upon save, reset the modification flag
		Store.setchanged(false);
		currentlySaving = false;
	});
};

Buttons.majorselect = function() {
	var major = majors[parseInt($("#sem_majorchange").attr("value"), 10)];
	Schedule.setMajor(major["Code"]);
	Store.setchanged(true);
}

/**
Is a search currently being performed?
*/
Buttons.searching = false;

/**
Perform a search using updatesearch. Use a delay and ensure that multiple calls do not occur
*/
Buttons.dosearch = function() {
	if (!Buttons.searching) {
		$("#searchimg").attr("src","img/progress.gif");
		setTimeout(Buttons.updatesearch, 300);
	}
	Buttons.searching = true;
};

/**
Update the course search area
*/
Buttons.updatesearch = function() {
	//split by a comma delimiter in the search
	var texts = $("#search").attr("value").split(",");
	$("#clinner").children().each(function(i) {
		var course = $(this).data("course");
		var strings = [course["Code"], course["Nickname"], course["Title"], course["Instructors"]];
		//categories in the UI
		var cats = [true, true, $("#search_title").attr("checked"), $("#search_faculty").attr("checked")];
		
		//match to courses
		var match = false;
		for (var x = 0; x < strings.length; ++x) {
			if (cats[x]) {
				for (var y = 0; y < texts.length; ++y) {
					if (strings[x].toLowerCase().indexOf(texts[y].toLowerCase()) > -1) {
						match = true;
					}
				}
			}
		}
		
		$(this).css("display", (match || texts == [""]) ? "inline" : "none");
	});
	Buttons.searching = false;
	$("#searchimg").attr("src","img/find.png");
};