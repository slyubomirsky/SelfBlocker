var DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function get_day_rule() {
    let ret = [];
    for (let i = 0; i < DAYS.length; i++) {
        let day = DAYS[i];
        let val = $("input[type=checkbox][name=" + day + "]:checked").val();
        if (val) { ret.push(i); }
    }
    return ret;
}

$(function() {
  $("#set").click(function() {
    let url_rule = $("input").val();
    let start_hour = parseInt($("#start").val());
    let end_hour = parseInt($("#end").val());
    
    let day_rule = get_day_rule();
    // don't bother if there are no days specified
    if (day_rule.length == 0) {
        return;
    }
    
    if (end_hour < start_hour) {
        alert("Invalid time interval specified! End hour must be greater than start hour!");
        return;
    }
    
    let message = {"flag": "set", "key": url_rule, "days": day_rule, "hours": [start_hour, end_hour]};
    chrome.runtime.sendMessage(message);
  });
  
  $("#warn").click(function() {
    let message = {"flag": "warn", "key": "toggle"};
    chrome.runtime.sendMessage(message);
  });
  
  $("#rm").click(function() {
    let url_rule = $("input").val();
    let message = {"flag": "rm", "key": url_rule};
    chrome.runtime.sendMessage(message);
  });

  $("#ls").click(function() {
    chrome.storage.local.get("rules", function(items) {
      let rules = items["rules"];
      let msg = "Rules set (URL blocked: days [hours]):\n"
      for (const url_rule in rules) {
        msg += url_rule + ": ";
        let block_table = rules[url_rule];
        let blocks = [];
        for (const day in block_table) {
            let hours = block_table[day];
            blocks.push(DAYS[day] + " (" + hours[0] + " to " + hours[1] + ")");
        }
        msg += blocks.join(", ") + "\n";
      }
      chrome.storage.local.get("warn", function(item) {
          msg += "Warnings active: " + item["warn"] + "\n";
          alert(msg);
      });
    });
  });
});
