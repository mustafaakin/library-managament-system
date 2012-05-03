$(document).ready(function(){
	function reloadContent(index){
		$(".menu-button:eq(" + index +  ")").trigger("click");
	}

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

	$("#searchForm").submit(function(){
		var keyword = $("#searchText").val();
		$.get('/items/' + keyword, function(data){
			$("#panel-content").html(data);
		});
		return false;
	});

	$(".item-search-result-list-element").live("click", function(){
		var ID = $(this).data("id");
		var category = $(this).data("category");
		$.get("/item/" + ID + "/" + category, function(data){
			$("#item-details-modal").html(data).modal();
		});
	});

	$("#addStaffBtn").live("click",function(){
		var name = $("#name").val();
		var password = $("#password").val();
		var birthday = $("#birthday").val();
		var formValues = "name=" + name + "&password=" + password + "&birthday=" + birthday;
		$.post("/admin/staff/add", formValues, function(data){
			location.reload();
		});
		return false;;
	});

	var currentUser = 0;
	$("#searchUserDetailsBtn").live("click", function(){
		var who = $("#searchUserDetailsName").val();
		$.get("/panel/staff/checkout/" + who, function(data){
			$("#panel-content").html(data);
			currentUser = who;
		});
		return false;
	});

	$("#checkin-search-btn").live("click", function(){
		var id = $("#checkin-search-id").val();
		$.get("/item/" + id, function(data){
			$("#book-search-results").html(data).modal();
		});
		return false;
	});

	$("#checkInBtn").live("click", function(){
		var itemID = $(this).data("itemid");
		var userID = currentUser;
		$.get("/staff/checkin/" + userID + "/" + itemID, function(data){
			location.reload();
		});
		return false;
	});

	$("#add-book-form-addBtn").live("click", function(){
		var formValues = $("#add-book-form").serialize();
		$.post("/staff/add/book/", formValues, function(data){
			$("#add-book-status").show(500);
			setTimeout(function(){
				$("#add-book-status").hide(500);
			}, 4000);
		});
		return false;
	});
	
	$("#add-video-form-addBtn").live("click", function(){
		var formValues = $("#add-video-form").serialize();
		$.post("/staff/add/video/", formValues, function(data){
			$("#add-video-status").show(500);
			setTimeout(function(){
				$("#add-video-status").hide(500);
			}, 4000);
		});
		return false;
	});

	$("#add-audio-form-addBtn").live("click", function(){
		var formValues = $("#add-audio-form").serialize();
		$.post("/staff/add/audio/", formValues, function(data){
			$("#add-audio-status").show(500);
			setTimeout(function(){
				$("#add-audio-status").hide(500);
			}, 4000);
		});
		return false;
	});

	$("#add-audio-form-addBtn").live("click", function(){
		var formValues = $("#add-audio-form").serialize();
		$.post("/staff/add/audio/", formValues, function(data){
			$("#add-audio-status").show(500);
			setTimeout(function(){
				$("#add-audio-status").hide(500);
			}, 4000);
		});
		return false;
	});


	$("#add-ematerial-form-addBtn").live("click", function(){
		var formValues = $("#add-ematerial-form").serialize();
		$.post("/staff/add/ematerial/", formValues, function(data){
			$("#add-ematerial-status").show(500);
			setTimeout(function(){
				$("#add-ematerial-status").hide(500);
			}, 4000);
		});
		return false;
	});



});
