var DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function get_day_rule() {
	let ret = [];
	for (let i = 0; i < DAYS.length; i++) {
		var day = DAYS[i];
		let val = $("input[type=checkbox][name=" + day + "]:checked").val();
		if (val) { ret.push(i); }
	}
	return ret;
}

$(function() {
  $("#set").click(function() {
	let url_rule = $("input").val();
	let day_rule = get_day_rule();
	// don't bother if there are no days specified
	if (day_rule.length == 0) {
		return;
	}
	let message = {"flag": "set", "key": url_rule, "value": get_day_rule()};
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
	  let msg = "Rules set (URL blocked: days):\n"
	  for (const url_rule in rules) {
		let days = rules[url_rule];
		msg += url_rule + ": " + days.map(d => DAYS[d]) + "\n";
	  }
	  alert(msg);
	});
  });
});
