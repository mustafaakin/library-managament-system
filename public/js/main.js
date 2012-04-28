$(document).ready(function(){
	$('[rel=tooltip]').tooltip();

	$(".menu-button").bind("click", function(){
		$("#menu-bar > .active").removeClass("active");
		$(this).parent().addClass("active");
		var path = $(this).attr("href");
		path = path.substr(1);
		$.get("/panel/" + path, function(data,error){
			$("#panel-content").html(data);
		});
		return false;
	});

	var page = $("body").data("page");
	if ( page.indexOf("panel") != -1){
		$(".menu-button:first").trigger("click");
	}	
});
