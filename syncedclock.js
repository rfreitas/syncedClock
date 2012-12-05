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
	http://stackoverflow.com/questions/10900907/good-precision-for-sync-time-with-ntp-over-javascript

DEsign notes:
	clock may drift further, meaning that when synced it will actually go back in time
	this might be a serious case for some usecase
		solution: if the clock as drifted further, pause it and resume/sync it when the times align
*/

(function(window){
	
	var constructor =
	window.sclock	= function(interval, host){
		if ( this === window){
			//design decision, why not make this factory option a new function and keep the contructor clean?
			//because this way the user can print the exported function a see the arguments quite clearly
			//he may also recognize the factory pattern
			var args = arguments;
			var FastConst = function(){
				return constructor.apply(this, args);
			};

			return new FastConst();
		}

		var out = this;

		if (!interval)	interval	= 1000;
		if (!host)		host		= window.location.origin + "/jsclock";

		out.interval = function(newInterval){
			if (newInterval) interval = newInterval;

			return interval;
		};//ms

		out.host = function( newHost ){
			if (newHost) host = newHost;

			return host;
		};

		out.getCurrentTime = function(){
			return Date.now();
		};

		function syncTime() {
		    // Set up our time object, synced by the HTTP DATE header
		    // Fetch the page over JS to get just the headers
		    console.log("syncing time");
		    var r = new window.XMLHttpRequest();
		    r.overrideMimeType("application/json");
		    var start = out.getCurrentTime();

		    r.open('GET', out.host() , false);
		    r.onreadystatechange = function()
		    {
		        if (r.readyState != 4)
		        {
		            return;
		        }
		        var latency = out.getCurrentTime() - start;
		        var timestring = JSON.parse(r.responseText).epoch;

		        console.log("woot!:"+timestring);

		        // Set the time to the **slightly old** date sent from the
		        // server, then adjust it to a good estimate of what the
		        // server time is **right now**.
		        var systemtime = new Date(timestring);
		        systemtime.setMilliseconds(systemtime.getMilliseconds() + (latency / 2));
		    };
		    r.send(null);
		}
		
		syncTime();
	};

})(window);