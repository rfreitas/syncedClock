//JSHint globals
/*global window:true,
sharejs:true,
ko:true,
URI:true,
_:true,
Handlebars:true,
YT:true,
cuid:true
*/
//--------------------------------------

//offers a synced epoched clock

/*
references:
	http://en.wikipedia.org/wiki/Clock_synchronization#Network_Time_Protocol
	http://jehiah.cz/a/ntp-for-javascript
	http://stackoverflow.com/a/10586177/689223
*/

(function(window){
	var out      =
	window.clock = {};

	out.interval = 1000;//ms

	out.hostorigin = window.location.origin;
	out.hostsuffix = "/jsclock";

	out.host = function(){
		return out.hostorigin + out.hostsuffix;
	};

	out.getCurrentTime = function(){
		return Date.now();
	};

	function syncTime() {
	    // Set up our time object, synced by the HTTP DATE header
	    // Fetch the page over JS to get just the headers
	    console.log("syncing time")
	    var r = new XMLHttpRequest();
	    var start = out.getCurrentTime();

	    r.open('HEAD', document.location, false);
	    r.onreadystatechange = function()
	    {
	        if (r.readyState != 4)
	        {
	            return;
	        }
	        var latency = out.getCurrentTime() - start;
	        var timestring = r.getResponseHeader("DATE");

	        console.log("woot!:"+timestring);

	        // Set the time to the **slightly old** date sent from the
	        // server, then adjust it to a good estimate of what the
	        // server time is **right now**.
	        systemtime = new Date(timestring);
	        systemtime.setMilliseconds(systemtime.getMilliseconds() + (latency / 2))
	    };
	    r.send(null);
	}
	
})(window);