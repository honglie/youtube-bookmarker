chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	chrome.pageAction.show(sender.tab.id);
	sendResponse();
});

function inject(){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		if(tabs[0]){
			console.log(tabs[0].url);
			if(tabs[0].url.toString().indexOf("https://www.youtube.com/watch?") > -1){
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
						if (response) {
							console.log("Already there");
						}
						else {
							console.log("injected");
							chrome.tabs.executeScript(null, { file: "src/inject/jquery.js" }, function() {
								chrome.tabs.executeScript(null, { file: "src/inject/inject.js" });
							});
						}
					});
				});
			}
		}
	});
}

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details){
	if(details.frameId === 0) {
			chrome.tabs.get(details.tabId, function(tab) {
				if(tab.url === details.url) {
					console.log("onHistoryStateUpdated");
					inject();
				}
			});
		}
});


console.log = function(msg){

};