(function($) {
  $.getStylesheet = function (href) {
	var $d = $.Deferred();
	var $link = $('<link/>', {
	   rel: 'stylesheet',
	   type: 'text/css',
	   href: href
	}).appendTo('head');
	$d.resolve($link);
	return $d.promise();
  };

  
})(jQuery);


$.ajaxSetup({cache:true});
if(typeof(loading)!="function") var loading = function(){};
if(typeof(not_loading)!="function") var not_loading = function(){};



function PyformsManager(){
	
	this.applications = [];
	$.ajaxSetup({async: false, cache: true});

	$.getStylesheet("/static/pyforms.css");
	$.getScript("/static/jquery.json-2.4.min.js");
	$.getScript("/static/base64.js");

	$.getScript("/static/pyformsjs/ControlBase.js");
	$.getScript("/static/pyformsjs/ControlText.js");
	$.getScript("/static/pyformsjs/ControlButton.js");
	$.getScript("/static/pyformsjs/ControlFile.js");
	$.getScript("/static/pyformsjs/ControlDir.js");
	$.getScript("/static/pyformsjs/ControlSlider.js");
	$.getScript("/static/pyformsjs/ControlCheckBox.js");
	$.getScript("/static/pyformsjs/ControlCombo.js");
	$.getScript("/static/pyformsjs/ControlDate.js");
	$.getScript("/static/pyformsjs/ControlImage.js");
	$.getScript("/static/pyformsjs/ControlList.js");
	$.getScript("/static/pyformsjs/ControlPlayer.js");
	$.getScript("/static/pyformsjs/ControlProgress.js");
	$.getScript("/static/pyformsjs/ControlBoundingSlider.js");
	$.getScript("/static/pyformsjs/ControlVisVis.js");
	$.getScript("/static/pyformsjs/ControlLabel.js");
	$.getScript("/static/pyformsjs/ControlTimeout.js");
	$.getScript("/static/pyformsjs/ControlEmptyWidget.js");
	$.getScript("/static/pyformsjs/ControlMenu.js");
	$.getScript("/static/pyformsjs/ControlWorkflow.js");
	$.getScript("/static/pyformsjs/BaseWidget.js");


	$.getScript("/static/jquery.flowchart/jquery.panzoom.min.js");
	$.getScript("/static/jquery.flowchart/jquery.mousewheel.min.js");
	$.getScript("/static/jquery.flowchart/jquery.flowchart.min.js");
	$.getStylesheet("/static/jquery.flowchart/jquery.flowchart.min.css");

	$.getScript("/static/jqplot/jquery.jqplot.min.js");
	$.getScript("/static/jqplot/plugins/jqplot.cursor.js");
	$.getScript("/static/jqplot/plugins/jqplot.logAxisRenderer.min.js");
	$.getScript("/static/jqplot/plugins/jqplot.canvasTextRenderer.min.js");
	$.getScript("/static/jqplot/plugins/jqplot.canvasAxisLabelRenderer.min.js");
	$.getScript("/static/jqplot/plugins/jqplot.blockRenderer.min.js");
	$.getScript("/static/jqplot/plugins/jqplot.enhancedLegendRenderer.min.js");
	$.getScript("/static/jqplot/plugins/jqplot.logAxisRenderer.min.js");
	$.getScript("/static/jqplot/plugins/jqplot.dateAxisRenderer.min.js");
	$.getScript("/static/jqplot/plugins/jqplot.categoryAxisRenderer.min.js");
	$.getScript("/static/jqplot/plugins/jqplot.barRenderer.min.js");
	$.getScript("/static/jqplot/plugins/jqplot.pointLabels.min.js");
	$.getStylesheet("/static/jqplot/jquery.jqplot.min.css");

	$.ajaxSetup({async: true, cache: false});
}

////////////////////////////////////////////////////////////



PyformsManager.prototype.add_app = function(app){

	//remove the application first
	for(var i=0; i<this.applications.length; i++)
		if( this.applications[i]!=undefined && this.applications[i].widget_id==app.widget_id ){
			this.applications[i].close_sub_apps();
			delete this.applications[i];
			this.applications.slice(i,1);
			break;
		}

	this.applications.push(app);

	
};

////////////////////////////////////////////////////////////

PyformsManager.prototype.remove_app = function(app_id){
	for(var i=0; i<this.applications.length; i++)
		if( this.applications[i]!=undefined && this.applications[i].widget_id==app_id ){
			var app = this.applications[i];
			app.close();
			delete this.applications[i];
			this.applications.slice(i,1);
			
			break;
		}
};


////////////////////////////////////////////////////////////

PyformsManager.prototype.find_app = function(app_id){
	for(var i=0; i<this.applications.length; i++){
		if( this.applications[i]!=undefined && this.applications[i].widget_id==app_id ) return this.applications[i]
	}
	return undefined;
};

PyformsManager.prototype.find_control = function(control_id){	
	var ids 			= this.split_id(control_id);
	var widget_id 		= ids[0];
	var control_name 	= ids[1];

	var widget = this.find_app(widget_id);
	return widget.find_control(control_name);
};


PyformsManager.prototype.split_id = function(control_id){	
	var split_in 		= control_id.lastIndexOf("-");
	var widget_id 		= control_id.substring(0, split_in);
	var control_name 	= control_id.substring(split_in+1);

	return [widget_id, control_name];
};


PyformsManager.prototype.query_server = function(basewidget, data2send, show_loading){	
	if(data2send===undefined) 		data2send = {};
	if(show_loading===undefined) 	show_loading = true;

	if(basewidget.parent_id!==undefined){
		var parent_widget = basewidget.parent_widget();
		this.query_server(parent_widget, data2send);
	}else{
		if(show_loading) basewidget.loading();
		data2send = basewidget.serialize_data(data2send);
		var jsondata =  $.toJSON(data2send);
		var self = this;
		$.ajax({
			method: 'post',
			cache: false,
			dataType: "json",
			url: '/pyforms/update/'+basewidget.name+'/?nocache='+$.now(),
			data: jsondata,
			contentType: "application/json; charset=utf-8",
			success: function(res){
				if( res.result=='error' )
					error(res.msg);
				else
					for(var i=0; i<res.length; i++){
						var app = self.find_app(res[i]['uid']);
						app.deserialize(res[i]);
					};
			}
		}).fail(function(xhr){
			error(xhr.status+" "+xhr.statusText+": "+xhr.responseText);
		}).always(function(){
			if(show_loading) basewidget.not_loading();
		});

		if(  basewidget.events_queue.length>0 )  this.query_server(basewidget, basewidget.events_queue.pop(0) );
	}
}




////////////////////////////////////////////////////////////
if(pyforms==undefined) var pyforms = new PyformsManager()
////////////////////////////////////////////////////////////

