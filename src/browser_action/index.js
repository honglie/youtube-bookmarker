function displayBookmarks(){
	chrome.storage.sync.get(null, function(items) {
		keys = Object.keys(items)
		for(i = 0 ; i < keys.length; i++){
			key = keys[i];
			if(key.indexOf("youtubeBookmarker") > -1){
				$("#welcome-panel").css("display", "none");
				name = items[key].name;
				if(name.length > 60){
					name = name.substring(0,60) + " ..."
				}
				$("#bookmarkedUrls").append("<div id='" + key + "' class=\"list-group-item\"><input class='itemsToDelete' type='checkbox' value='" + key + "'>&nbsp;<a href='" + items[key].url + "'>" + name + "</a></div>");
				if(i == keys.length - 1){
					$("#bookmarkedUrls > div > a").on("click", function(e){
						chrome.tabs.create({url: e.target.href});
					});
				}
				
			}
		}	
	});
}

$("#profile").on("click", function(e){
	chrome.tabs.create({url: e.target.href});
});

$("#deleteBtn").on("click", function(){
	var selected = [];
	$('#bookmarkedUrls div input:checked').each(function() {
    	selected.push($(this).attr('value'));
	});

	if(selected.length == 0){
		alert("You have not selected any bookmarks to delete.")
	}
	else{
		for(var i = 0; i < selected.length; i++){
			chrome.storage.sync.remove(selected[i],function(){});
			$("#" + selected[i]).remove();
		}
	}
});

$("#shareBtn").on("click", function(){
	chrome.storage.sync.get(null, function(items) {
		var textToWrite = JSON.stringify(items);
		var textFileAsBlob = new Blob([textToWrite], {type:'application/json'});
		var fileNameToSaveAs = "youtubeBookmarker.json";
		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
		downloadLink.innerHTML = "My Hidden Link";
		window.URL = window.URL || window.webkitURL;
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		downloadLink.click();
	});
});

$("#importBtn").on("click", function(){
	var jsonData = prompt("Copy and paste contents from youtubeBookmarker.json");
	if (jsonData == null || jsonData == "") {
		return false;
	} else {
		chrome.storage.sync.set(JSON.parse(jsonData), function() {
			if(chrome.runtime.lastError){
				alert("Oops. Something went wrong.");
				return;
			}
			else{
				alert("Import successful.");
				window.close();
			}
		});
	}
});

function destroyClickedElement(event)
{
	document.body.removeChild(event.target);
}

displayBookmarks();