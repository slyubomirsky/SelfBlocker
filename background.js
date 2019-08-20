// map: url rules -> array of days of week to block URL pattern
// (days of week = integers from 0 to 6, 0 being Sun. and 6, Sat.)
var LOCAL_MAP = {};

// check tab URL and if it's a forbidden URL,
// replace the body with a message
function enforce_tab_rules() {
	var day = new Date().getDay();
	
	for (const url_rule in LOCAL_MAP) {
		let days = LOCAL_MAP[url_rule];
		if (!days.includes(day)) {
			continue;
		}
		chrome.tabs.query({"url": url_rule}, function(tabs) {
			for (const tab of tabs) {
				let message1 = "Closed tab " + tab.url + " because it matched rule " + url_rule;
				let message2 = "Update the rule or deactivate Self-Closer plugin to view.";
				alert(message1 + "\n" + message2);
				chrome.tabs.remove(tab.id, function() { console.log("Closing"); });
			}
		});
	}
}

chrome.runtime.onInstalled.addListener(function(details) {
	chrome.storage.local.set({"rules": {}}, function() {
		console.log("Value is set to " + {});
	});
});

chrome.runtime.onStartup.addListener(function() {
	chrome.storage.local.get("rules", function(items) {
		LOCAL_MAP = items["rules"];
	});
});

// receiving messages from the popup: messages may be to add
// set rules or remove rules
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('receiving');
 	console.log(request);
	
	if (request.flag == "set") {
		LOCAL_MAP[request.key] = request.value;
		chrome.storage.local.set({"rules": LOCAL_MAP});
	}
	if (request.flag == "rm") {
		console.log("Received rm: " + request.key);
		delete LOCAL_MAP[request.key];
		console.log(LOCAL_MAP);
		chrome.storage.local.set({"rules": LOCAL_MAP});
	}
	
	enforce_tab_rules();
});

chrome.tabs.onCreated.addListener(enforce_tab_rules);
chrome.tabs.onUpdated.addListener(enforce_tab_rules);