// map: url rules -> {day of week -> [block hour start, block hour end]}
// (days of week = integers from 0 to 6, 0 being Sun. and 6, Sat.)
var LOCAL_MAP = {};
// Raise warnings: whether to raise an alert window upon closing a tab.
// Raising a warning is nice for the user (no mysterious tab closings)
// but makes it possible to read the tab anyway.
var RAISE_WARNINGS = false;

// check tab URL and if it's a forbidden URL,
// replace the body with a message
function enforce_tab_rules() {
    let date = new Date();
    let day = date.getDay();
    let hour = date.getHours();
    
    for (const url_rule in LOCAL_MAP) {
        let rules = LOCAL_MAP[url_rule];
        if (!(day in rules)) {
            continue;
        }
        let [start, end] = rules[day];
        if (hour < start || hour > end) {
            continue;
        }
        
        chrome.tabs.query({"url": url_rule}, function(tabs) {
            for (const tab of tabs) {
                if (RAISE_WARNINGS) {
                    let message1 = "Closed tab " + tab.url + " because it matched rule " + url_rule;
                    let message2 = "Update the rule or deactivate Self-Closer plugin to view.";
                    alert(message1 + "\n" + message2);
                }
                chrome.tabs.remove(tab.id, function() { console.log("Closing"); });
            }
        });
    }
}

chrome.runtime.onInstalled.addListener(function(details) {
    chrome.storage.local.set({"rules": {}, "warn": false}, function() {
        console.log("Value is set to " + {});
    });
});

chrome.runtime.onStartup.addListener(function() {
    chrome.storage.local.get("rules", function(items) {
        LOCAL_MAP = items["rules"];
    });
    chrome.storage.local.get("warn", function(items) {
        let warn_flag = items["warn"];
        if (typeof warn_flag === 'undefined') {
            RAISE_WARNINGS = false;
            return;
        }
        RAISE_WARNINGS = warn_flag;
    });
});

// receiving messages from the popup: messages may be to add
// set rules or remove rules
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('receiving');
    console.log(request);
    
    if (request.flag == "warn") {
        RAISE_WARNINGS = !RAISE_WARNINGS;
    }
    if (request.flag == "set") {
        if (!(request.key in LOCAL_MAP)) {
            LOCAL_MAP[request.key] = {};
        }
        for (const day of request.days) {
            LOCAL_MAP[request.key][day] = request.hours;
        }
    }
    if (request.flag == "rm") {
        console.log("Received rm: " + request.key);
        delete LOCAL_MAP[request.key];
        console.log(LOCAL_MAP);
    }
    
    chrome.storage.local.set({"rules": LOCAL_MAP, "warn": RAISE_WARNINGS});
    enforce_tab_rules();
});

chrome.tabs.onCreated.addListener(enforce_tab_rules);
chrome.tabs.onUpdated.addListener(enforce_tab_rules);