chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if (request.greeting == "hello"){
		sendResponse({message: "hi"});
		loadstart();
	}
});

$(document).ready(function(){
	initialize();
});

function initialize(){
	var style = document.createElement('link');
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = chrome.extension.getURL('src/inject/inject.css');
	(document.head||document.documentElement).appendChild(style);
	
	var isVideoOnPage = document.querySelector('video');
	if(isVideoOnPage !== null){	
		loadstart();
	}
	else{
		mutationObs(function(data){
			loadstart();
		});
	}
}


function mutationObs(callback){
	var menuFound = false;
	var videoFound = false;	
	if($("body").html().toString().indexOf("<video") > -1){
		if($("body").html().toString().indexOf("More</span>") > -1){
			return callback(true);
		}
	}
	else{
		if($("body").html().toString().indexOf("yt-uix-menu") > -1){
			menuFound = true;
		}
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if(!videoFound || !menuFound){
					if (!mutation.addedNodes) return;
					for (var i = 0; i < mutation.addedNodes.length; i++) {
						var node = mutation.addedNodes[i];						
						var htmlString = node.outerHTML;
						if(htmlString){
							if(htmlString.indexOf("More</span>") > -1){								
								menuFound = true;
							}
							if(htmlString.indexOf("<video") > -1){								
								videoFound = true;
							}
							if(videoFound && menuFound){
								observer.disconnect();
								return callback(true);
							}
						}
					}
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: false,
			characterData: false
		});
	}
}

function checkMoreButton(callback){
	var menuFound = false;

	if($("body").html().toString().indexOf("More</span>") > -1){		
		menuFound = true;
		return callback(true);
	}
	else{
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if(!menuFound){
					if (!mutation.addedNodes) return;
					for (var i = 0; i < mutation.addedNodes.length; i++) {
						var node = mutation.addedNodes[i];						
						var htmlString = node.outerHTML;
						if(htmlString){
							if(htmlString.indexOf("More</span>") > -1){								
								menuFound = true;
								observer.disconnect();
								return callback(true);
							}
						}
					}
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: false,
			characterData: false
		});
	}
}

function loadstart(){
	var url = location.href;	
	var videoId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);	
	if(videoId){
		videoId = videoId[1];
		document.querySelector('video').addEventListener('loadstart', function(){
			bookmarkerBtn();
		});

		if (!jQuery.isReady) {
			$(document).on('ready', function(){			
				bookmarkerBtn();
			});
		}
		else{		
			bookmarkerBtn();
		}
	}
}

function bookmarkerBtn(){	
	var url = location.href;
	var videoId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
	if(videoId){
		var notesBtn = document.getElementById("youtube-notes-btn");
		if(notesBtn == null){
			checkMoreButton(function(data){
				if(data){
					var menuItems = document.querySelectorAll(".yt-uix-button-content");
					var lastButtonBeforeMyButton;
					for(var i = 0; i < menuItems.length; i++){
						if(menuItems[i].innerHTML == "More"){
							lastButtonBeforeMyButton = menuItems[i].parentNode.parentNode;
							break;
						}
					}

					var myButton = "<div class = 'youtube-notes yt-uix-menu'><button class = 'yt-uix-button yt-uix-button-size-default yt-uix-button-opacity yt-uix-button-has-icon no-icon-markup pause-resume-autoplay yt-uix-menu-trigger yt-uix-tooltip' type = 'button' id = 'youtube-notes-btn'>&#9733;&nbsp;&nbsp;Bookmarker</button></div>";
					if(document.getElementById("youtube-notes-btn") == null){
						$(lastButtonBeforeMyButton).after(myButton);	
						$("#youtube-notes-btn").on("click", function(){
							bookmarker();
						});		
						return;			
					}
				}
			});
		}
	}
}

function bookmarker(){
	var parentDivForBookmarker = $("#watch7-sidebar");
	if(document.getElementById("player-playlist") !== null){
		$("#player-playlist .watch-playlist").css("margin-top", 360);
	}

	var bookmarkerDOM = "<div style='height:760px;' id='youtube-sidebar-notes' " + 
		"class='watch-sidebar-gutter yt-card yt-card-has-padding yt-uix-expander " +
		"yt-uix-expander-collapsed'>" +
		"<div id = 'header'>Bookmarks</div>" +
		"<div style='margin-top:10px;'>" +
		"<div style='margin-bottom: 5px;'>" +
		"<div style='display:inline-block; margin-right: 5px; border:solid 1px #d3d3d3'>" +
		"<input type='text' class='inputTxt' id='bookmark-start' placeholder='Start time' disabled/>" +
		"<input class='inputBtn' type='button' value='Set' id='setstarttime' /></div>" +
		"<div style='display:inline-block; margin-right: 5px; border:solid 1px #d3d3d3'>" +
		"<input class='inputTxt' type='text' placeholder='Stop time' id='bookmark-stop' disabled/>" +
		"<input class='inputBtn' type='button' value='Set' id='setstoptime' /></div>" + 
		"<div  style='display:inline-block; border:solid 1px #d3d3d3'>" +
		"<input type='text' class='inputTxt' id='bookmark-name' placeholder='Title' tyle='width:200px;'/><p>" +
		"<div style='display:inline-block; border:solid 1px #d3d3d3'> "+
         "<input type='text' class='inputTxt' id='bookmark-comments' placeholder='Comments' style='width:200px;'/> "+
         "<input type='button' class='inputBtn' id='submitbookmark' value='Save' /></div>" +
         "</div>"+
		"<div style='display:none;'><label>Current : </label><input type='text' id='currentTimeOnVideo' /></div></div>" +
		"<div id='savedBookmarksDiv'></div>" +
		"<div style='text-align:right; margin-top: 10px;'>" +
		"<a id='youtube-notes-close' class='yt-uix-button yt-uix-button-default yt-uix-button-size-default'>" +
		"<span class='yt-uix-button-content'>Close</span></a></div></div>";
		
	
		$(parentDivForBookmarker).prepend(bookmarkerDOM);
	
		
	
	document.getElementById("youtube-notes-btn").disabled = true;

	bookmarkerMethods();

}

function bookmarkerMethods(){

	var url = location.href;
	var videoId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];

	var currentTimeOnVideo = 0;
	var stopVideoAtEndTime = false;
	var endTime = 0;

	//Timer
	setInterval(function(){
		currentTimeOnVideo = Math.floor($(".html5-main-video")[0].currentTime);
		$("#currentTimeOnVideo").val(currentTimeOnVideo);
		if(stopVideoAtEndTime && endTime != 0){
			if(currentTimeOnVideo == endTime){
				stopVideoAtEndTime = false;
				endTime = 0;
				$(".html5-main-video")[0].pause();
			}
		}
	}, 1000);

	//Loads saved bookmarks
	getBookmarks(videoId, function(data){
		if(data){
			var keys = Object.keys(data)
			for(i = 0 ; i < keys.length; i++){
				
				$("#savedBookmarksDiv").append(data[keys[i]].content);
				
				if(i == keys.length - 1){
					$(".savedBookmark").on("click", function(e){
						var target = e.target;
						$(".html5-main-video")[0].currentTime = $(target).attr("starttime");
						$(".html5-main-video")[0].play();
						endTime = $(target).attr("stoptime");
						stopVideoAtEndTime = true;
					});
				}
			}
		}
	});

	//Set start time button
	$("#setstarttime").on("click", function(){
		
		//Mod by HL to fix the bug to show proper start time
		var time = Math.floor($(".html5-main-video")[0].currentTime);
		var hr=Math.floor(time/3600);
		var minute=Math.floor((time%3600)/60);
		var seconds=time%60;
		
		var time_display="";
		if(hr>0){
			time_display+= "" + hr + ":" + (minute<10 ? "0" :"") ;
		}
		
		time_display += "" + minute + ":" + (seconds < 10 ? "0" : "");
		time_display += "" + seconds;
		 
		$("#bookmark-start").val(time_display);	
		$("#bookmark-start").attr('seconds', time);
	});

	//Set stop time button
	$("#setstoptime").on("click", function(){
		
		//Mod by HL to fix the bug to show proper stop time
		var time = Math.floor($(".html5-main-video")[0].currentTime);
		var hr=Math.floor(time/3600);
		var minute=Math.floor((time%3600)/60);
		var seconds=time%60;
		
		var time_display="";
		if(hr>0){
			time_display+= "" + hr + ":" + (minute<10 ? "0" :"") ;
		}
		
		time_display += "" + minute + ":" + (seconds < 10 ? "0" : "");
		time_display += "" + seconds;
		$("#bookmark-stop").val(time_display);	
		$("#bookmark-stop").attr('seconds', time);
		$("#bookmark-").attr('seconds', time);
		$("#bookmark-stop").attr('seconds', time);
		
		/*
		var minute = "0" + Math.floor(time/60).toString();
		var seconds = "0" + Math.floor(time%60).toString();
		$("#bookmark-stop").val(minute.slice(-2) + ":" + seconds.slice(-2));	
		$("#bookmark-stop").attr('seconds', time);
		$("#bookmark-").attr('seconds', time);
		$("#bookmark-stop").attr('seconds', time);
		*/
	});

	//Save bookmark button
	$("#submitbookmark").on("click", function(){						
		var starttime = $("#bookmark-start").attr("seconds");
		var stoptime = $("#bookmark-stop").attr("seconds");
		if($("#bookmark-start").val() == ""){
			alert("Start time not set.");
			return;
		}
		var title = $("#bookmark-name").val();
		
		if(title == ""){
			title = $("#eow-title").html();
		}	
		
		//Mod by HL to check the video start and end timing
		if(parseInt(stoptime)< parseInt(starttime)){
			alert("Please check your stop time. It should end later than your start time.");
			return;
		}
		
		var comments=$("#bookmark-comments").val();
		//Mod by HL to check the comments/annotation text
		if(comments==""){
			alert("Please enter some text/annotations");
			return;
		}

		//Add bookmark to list
		var bookmarkId = Math.floor(Math.random()*1000000)
		var saveElement = '<div class="bookmark">&#9734;&nbsp;' +
		'<a id="' + bookmarkId + '" class="savedBookmark" starttime="' + starttime + '" ' +
		'stoptime="' + stoptime +  '"comments="'+comments+ 
		'" src="' + url + '">' + title + ' : ' + comments + '</a></div>';
		$("#savedBookmarksDiv").append(saveElement);
		
		//Clear input fields
		$("#bookmark-start").val("");
		$("#bookmark-stop").val("");
		$("#bookmark-name").val("");
		$("#bookmark-comments").val("");

		//Save bookmark
		var chromeData = {
			startTime : starttime,
			endTime : stoptime,
			comments: comments,
			content : saveElement
		};

		var url = location.href;
		var videoId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
		syncSave(videoId,bookmarkId, chromeData);
					
		//Set what happens when bookmark is clicked
		$("#" + bookmarkId)[0].onclick = function(e){							
			var anchor = e.target;
			$(".html5-main-video")[0].currentTime = $(anchor).attr("starttime");
			$(".html5-main-video")[0].play();
			endTime = $(anchor).attr("stoptime")
			stopVideoAtEndTime = true;
		}
	});

	document.getElementById("youtube-notes-close").onclick = function(){							
		if(document.getElementById("player-playlist") !== null){
			$("#player-playlist .watch-playlist").css("margin-top", 0);
		}
		document.getElementById("youtube-notes-btn").disabled = false;
		document.getElementById("youtube-sidebar-notes").remove();
	};
}
	
function getBookmarks(videoId, callback){
	chrome.storage.sync.get("youtubeBookmarker-" + videoId, function(items) {
		var pad = items["youtubeBookmarker-" + videoId];
		if(typeof pad !== "undefined" && pad != null){
			if(typeof items === "undefined" || Object.keys(pad).length == 0){
				return callback(false);
			}
			else{								
				return callback(pad);
			}
		}
		else{
			return callback(false);
		}
	});
}

function syncSave(videoId, bookmarkId, content){
	getBookmarks(videoId, function(data){
		if(data){
			data[bookmarkId] = content;			
			var jsonData = {};
			jsonData["youtubeBookmarker-" + videoId] = data;
			chrome.storage.sync.set(jsonData, function() {
				if(chrome.runtime.lastError){
       				alert("Oops. Something went wrong.");
       				return;
   				}
			});	
		}
		else{
			var item = {};
			var jsonData = {};
			item[bookmarkId] = content;
			item["name"] = $("#eow-title").html(),
			item["url"] = location.href,
			jsonData["youtubeBookmarker-" + videoId] = item;
			chrome.storage.sync.set(jsonData, function() {
				if(chrome.runtime.lastError){
       				alert("Oops. Something went wrong.");
       				return;
   				}
			});	
			
			$.ajax({
			url: "https://api.mongolab.com/api/1/databases/quotations/collections/quotesdb?apiKey=sYZGaP5s9sOGjM_rE7hZYirDHMMyRiQK",
			type: "POST",
			data: JSON.stringify( jsonData ),
			contentType: "application/json"
			}).done(function( msg ) {
			console.log(msg);
			});
		}
		
		
			
	});	
}

function destroyClickedElement(event){
	document.body.removeChild(event.target);
}

