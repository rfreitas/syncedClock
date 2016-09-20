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
	http://en.wikipedia.org/wiki/Clock_drift

	http://stackoverflow.com/questions/102064/clock-drift-on-windows
	 http://www.codinghorror.com/blog/2007/01/keeping-time-on-the-pc.html
	  security: http://www.lightbluetouchpaper.org/2006/09/04/hot-or-not-revealing-hidden-services-by-their-clock-skew/

DEsign notes:
	clock may drift further, meaning that when synced it will actually go back in time
	this might be a serious case for some usecase
		solution: if the clock as drifted further, pause it and resume/sync it when the times align
	syncing time maybe should be smooth? this could be important if the clock is being used
	 for animations, since it would make them jump too sudden


Design principles:
	duck friendly
	onFoo methods can be setted without fear of breaking the system
		onFoo methods if setted, they must be setted with a function, even if an empty one
		failure to do raises an exception and warns the user of a possible mistake in code
	properties follow the jQuery style, they are functions, so that they can be watched with such things as the applyance
		all properties must be set with a function, hidden variables must be enclosed
		private variables should be set by private functions, but in order to remain duck friendly
		private functions are named coventioned, they start with a _
*/

const sclock	= function(interval, host){
	if ( this === window){
		//design decision, why not make this factory option a new function and keep the contructor clean?
		//because this way the user can print the exported function a see the arguments quite clearly
		//he may also recognize the factory pattern
		var args = arguments;
		var FastConst = function(){
			return sclock.apply(this, args);
		};

		return new FastConst();
	}

	var out = this;
	console.log();
	if (!interval)	interval	= 30000;//research the best time
	if (!host)		host		= window.location.origin + "/jsclock";

	out.interval = function(newInterval){
		if (newInterval) interval = newInterval;
		return interval;
	};//ms

	out.host = function( newHost ){
		if (newHost) host = newHost;
		return host;
	};

	out.getSystemTime = function(){
		return Date.now();
	};

	out.getCurrentTime = function(){
		return this.getSystemTime() + this.difference;
	};

	out.onUpdate = function(){

	};

	out.onCorrection = function(adjustment){

	};

	(function(){
		var syncing = false;
		out.startSyncing = function(){
			if (syncing){
				syncing = true;
			}
		};
	})();


	(function(){
		var connected = false;
		out.isConnected = function(){
			return connected;
		};

		//to call when a connection is made with the server
		//why not make it the onConnected?
		//because the expectation is that onConnected methods can be
		//setted without fear of breaking the system, besides it's an event method
		//therefore it shouldn't be called with every connection, but rather when the
		//connection changes
		out._connected = function(){
			if ( !out.isConnected() ){
				out.onConnection();
			}
			connected = true;
		};

		out._disconnected = function(){
			if ( out.isConnected() ){
				out.onDisconnection();
			}
			connected = false;
		};
	})();


	out.onConnection = function(){};

	out.onDisconnection = function(){};


	out.acceptableRTT = function(rtt){
		//TODO make a better one maybe
		if ( rtt < 300){
			return true;
		}
		return false;
	};

	out.cancelNextSync = function(){

	};

	out.validateEpoch = function(epoch){
		return typeof epoch === "number" && epoch > 0;
	};

	out.sync = function () {
		// Set up our time object, synced by the HTTP DATE header
		// Fetch the page over JS to get just the headers
		//console.log("syncing time");
		var r = new window.XMLHttpRequest();
		//r.setRequestHeader("Content-type","application/json");
		var start = out.getSystemTime();

		var self = this;
		//console.log(out.host());
		r.open('GET', out.host() , false);

		r.onreadystatechange = function(){
			//console.log("readyState:"+r.readyState);
			var currentTime = self.getSystemTime();
			var rtt = currentTime - start;
			if (r.readyState != 4 || r.status != 200 ){
				//console.log("rtt:"+rtt);
				if (r.readyState == 4){
					self._disconnected();
				}
				console.log(arguments);
				return;
			}
			self._connected();

			var plain = JSON.parse(r.responseText);
			//console.log(plain);
			var epoch = plain.epoch;
			//TODO validate
			if ( !self.validateEpoch(epoch) ){
				return;
			}

			var serverCurrentTime = epoch + (rtt/2);
			var diff = serverCurrentTime - currentTime;
			//console.log("rtt:"+rtt);

			var adjustment = diff - self.difference;
			//TODO: consider the difference between the current clock time and time it needs to be set
			//not just the differnece between the two servers
			var interval = self.interval();
			if (  /*adjustment < 0*/false ){
				//clock will go backwards
				//solution, pause clock and wait diff time before updating it
				//this way clock will not run backwards

				var waiting = adjustment*-1;//waiting time before adjusting the paused clock
				self.pauseClock();

				var backTimeId = window.setTimeout( function(){
					self.difference = diff;
					self.resumeClock();

					var timeLeftForTheEndOfTheInterval = interval - waiting;
					window.setTimeout(
						function(){
							self.sync();
						},
						timeLeftForTheEndOfTheInterval
					);//calls the sync at the right interval

				}, waiting );
			}
			else{
				self.difference = diff;
				window.setTimeout(
					function(){
						self.sync();
					},
					interval
				);
			}

			//console.log("diff:"+diff);

			//console.log("woot!:"+epoch);

			//console.log("rtt:"+rtt);
		};
		r.send(null);
	};

	out.sync();
};

module.exports = sclock;
