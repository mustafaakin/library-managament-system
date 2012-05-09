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
		$.post("/panel/admin/staff/add", formValues, function(data){
			location.reload();
		});
		return false;;
	});

	var currentUser = 0;
	$("#searchUserDetailsBtn").live("click", function(){
		var who = $("#searchUserDetailsName").val();
		$.get("/panel/staff/checkin/" + who, function(data){
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
		$.get("/panel/staff/checkin/" + userID + "/" + itemID, function(data){
			var status = "alert-error";
			var cssType = "";
			if ( data == "ok"){
				status = "Item checked in to user.";
				cssType = "alert-success";
			} else if ( data == "user-limit"){
				status = "User has exceeded maximum checkouts.";
			} else if ( data == "not-borrowable"){
				status = "Requested item is not borrowable."
			} else {
				status = "unknown error";
			}
			$("#check-in-status").addClass(cssType).text(status).show(500);
			setTimeout(function(){
				$("#check-in-status").hide(500);
			},5000);
		});
		return false;
	});

	$("#add-book-form-addBtn").live("click", function(){
		var formValues = $("#add-book-form").serialize();
		$.post("/panel/staff/add/book/", formValues, function(data){
			$("#add-book-status").show(500);
			setTimeout(function(){
				$("#add-book-status").hide(500);
			}, 4000);
		});
		return false;
	});
	
	$("#add-video-form-addBtn").live("click", function(){
		var formValues = $("#add-video-form").serialize();
		$.post("/panel/staff/add/video/", formValues, function(data){
			$("#add-video-status").show(500);
			setTimeout(function(){
				$("#add-video-status").hide(500);
			}, 4000);
		});
		return false;
	});

	$("#add-audio-form-addBtn").live("click", function(){
		var formValues = $("#add-audio-form").serialize();
		$.post("/panel/staff/add/audio/", formValues, function(data){
			$("#add-audio-status").show(500);
			setTimeout(function(){
				$("#add-audio-status").hide(500);
			}, 4000);
		});
		return false;
	});

	$("#add-ematerial-form-addBtn").live("click", function(){
		var formValues = $("#add-ematerial-form").serialize();
		$.post("/panel/staff/add/ematerial/", formValues, function(data){
			$("#add-ematerial-status").show(500);
			setTimeout(function(){
				$("#add-ematerial-status").hide(500);
			}, 4000);
		});
		return false;
	});

	$("#add-user-form-submit-btn").live("click", function(){
		var formValues = $("#add-user-form").serialize();
		$.post('/panel/staff/register/', formValues, function(data){
			$("#add-user-status").show(500);
			setTimeout(function(){
				$("#add-user-status").hide(500);
			},4000);
		});
		return false;
	});


	$(".extendBtn").live("click", function(){
		var btn = $(this);
		var item = $(this).data("item");
		var user = $(this).data("user");
		var formValues = "item=" + item + "&user=" + user;
		$.post("/panel/staff/extend/", formValues, function(data){
			if ( data == "ok"){
				btn.text("OK");
			} else {
				btn.text("No extensions left");
			}
		});
	});


	var currentItem = 0;
	var currentUser = 0;
	$(".check-out").live("click", function(){
		var item = currentItem = $(this).data("item");
		var user = currentUser = $(this).data("user");
		$.get("/panel/staff/checkout/charge/"  + user + "/" + item + "/", function(data){
			var msg = "User does not have any charge to pay.";
			if ( data != 0){
				msg = "User has to pay " + data + " TL. Aceppt only if payment recieved.";
			}
			$("#check-out-message").text(msg);
			$("#check-out-modal").modal();
		});		
	});

	$("#confirm-checkout-btn").live("click", function(){
		var item = currentItem;
		var user = currentUser;
		$.get("/panel/staff/checkout/"  + user + "/" + item + "/", function(data){
			 $("#check-out-status").show(500);
			 setTimeout(function(){
			 	$("#check-out-status").hide(500);
			 },4000);
		});		
	});	

	$(".extend-item").live("click", function(){
		var btn = $(this);
		var item = $(this).data("item");
		var formValues = "item=" + item;
		$.post("/panel/normal/extend/", formValues, function(data){
			if ( data == "ok"){
				btn.text("OK");
			} else {
				btn.text("No extensions left");
			}
		});
	});

	$("#extend-membership-btn").live("click", function(){
		var user = $(this).data("id");
		$("#extend-membership-confirm-btn").data("user",user);
		$.get("/panel/staff/membershipdue/" + user, function(data){
			$("#membership-cost").text("Membership due for user " + user + " is " + data + " TL.");
			$("#extend-membership").modal();
		});
	});

	$("#extend-membership-confirm-btn").live("click", function(){
		var user = $(this).data("user");
		$.get("/panel/staff/membershipextend/" + user, function(data){
			$("#extend-membership-status").show(500);
			setTimeout(function(){
				$("#extend-membership-status").show(500);
			},4500);			
		});
	});

	$(".constraint-edit-btn").live("click", function(){
		var id = $(this).data("id");
		$.get("/panel/admin/constraints/" + id, function(data){
			$("#constraint-edit").html(data).modal();
		});
	});

	$("#confirm-constraint-edit-btn").live("click", function(){
		var constraintType = $(this).data("id");
		var formValues = $("#constraint-form").serialize();
		formValues = formValues + "&constraint=" + constraintType;
		console.log(formValues);
		$.post("/panel/admin/constraint/", formValues, function(){
			$("#edit-constraint-message").show(500);
			setTimeout( function(){
				$("#edit-constraint-message").hide(500);
			},4000);
		});
	});
});
