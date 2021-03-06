var firebase = require('firebase');
var fireClientDeliveries = new firebase('');;
var express = require("express");
var app = express();
var url = require("url");
var port = process.env.PORT || 5001;
app.use(express.logger());
app.listen(port, function() {
    console.log("Client listening on " + port);
});
var twilio = require('twilio')('', '');

var queue = [];
var WSPrequests = [];
var Greenwichrequests = [];
var UnionSquarerequests = [];
var SOHOrequests = [];
var ThirdAverequests = [];
var Gramarcyrequests = [];

var WSPLocations = ['Weinstein Hall', 'Hayden Hall', 'Founders Hall', 'Brittany Hall', 'Goddard Hall', 'Rubin Hall'];
var GreenwichLocations = ['Greenwich Hotel'];
var UnionSquareLocations = ['Carlyle Court', 'Coral Towers', 'Palladium Hall', 'W. 13th Street', 'University Hall'];
var SOHOLocations = ['Broome Street', 'Lafayette Hall', 'Second Street'];
var ThirdAveLocations = ['Alumni Hall', 'Seventh Street', 'Third Avenue North'];
var GramarcyLocations = ['Gramercy Green', '26th Street'];

var techatnyuNumbers = [];
var WSP = [''];
var Greenwich = [''];
var UnionSquare = [''];
var SOHO = [''];
var ThirdAve = [];
var Gramarcy = [''];
var Others = [''];

var determinePhoneByLocation = function(location, obj){
	if(WSPLocations.indexOf(location) >= 0){
		WSPrequests.push(obj);
	} else if(GreenwichLocations.indexOf(location) >= 0){
		Greenwichrequests.push(obj);
	} else if(UnionSquareLocations.indexOf(location) >= 0){
		UnionSquarerequests.push(obj);
	} else if(SOHOLocations.indexOf(location) >= 0) {
		SOHOrequests.push(obj);
	} else if(ThirdAveLocations.indexOf(location) >= 0) {
		ThirdAverequests.push(obj);
	} else if(GramarcyLocations.indexOf(location) >= 0) {
		Gramarcyrequests.push(obj)
	}
};

var submitRequestToIndividual = function(request, giveRequestTo){
	queue.push({person: giveRequestTo, information: request});
	twilio.sendMessage({
		to: giveRequestTo,
		from: '',
		body: "Location: " + request.location + ", Name: " + request.name + ", Phone Number: " + request.phonenumber
	}, function(err, responseData){
		if(err){
			console.log(err);
		}
	});
};

var sendAllTechatNYUPeopleSMS = function(){
	for(smsNumber in techatnyuNumbers){
		twilio.sendMessage({
			to: techatnyuNumbers[smsNumber],
			from: '+',
			body: "Hey y'all Tech@NYU peeps, Valentines day is beginning. Lets do this. - valentinebot"
		}, function(err, responseData){
			if(err){
				console.log(err);
			}
		});
	}
};

var sendSMSforConfirmation = function(name, phonenumber, location, recipient){
	twilio.sendMessage({
			to: phonenumber,
			from: '',
			body: "Hey " + name + ", we just received your request. We'll notify you when your rose is delivered to " + recipient + " at " + location;
	}, function(err, responseData){
		if(err){
			console.log(err);
		}
	});
};

var incomingRequest = function(ID, requestData){
	var name = requestData["sender"];
	var recipient = requestData["recipient"];
	var phonenumber = requestData["phoneNumber"];
	var location = (requestData["dorm"]) + ", Room:" + (requestData["roomNumber"]);
	var dorm = requestData["dorm"];
	var obj = {ID:ID, name:recipient, phonenumber:phonenumber, location:location};
	determinePhoneByLocation(dorm, obj);
	sendSMSforConfirmation(name, phonenumber, location, recipient);
};

var finishRequest = function(ID){
	var fireClientOutDeliveries = new firebase('' + ID);
	fireClientOutDeliveries.set(userData);
};

fireClientDeliveries.on('child_added', function(snapshot){
	var ID = snapshot.name(), requestData = snapshot.val();
	incomingRequest(ID, requestData);
});

var filledForNow = function(from){
    twilio.sendMessage({
		to: from,
		from: '',
		body: "All requests have been filled?? FOR NOW :)"
		}, function(err, responseData){
			if(err){
				console.log(err);
			}
	});
};

var deliveredNow = function(queue){
   twilio.sendMessage({
		to: queue["information"]["phonenumber"],
		from: '',
		body: "Your rose has been delivered!"
		}, function(err, responseData){
			if(err){
				console.log(err);
			}
	});
}

app.all('/getsms', function(req, res){
	var message = req.query.Body;
    var from = req.query.From;
    if(techatnyuNumbers.indexOf(from) >= 0){
    	if(message.toLowerCase() == "done"){
    		for(i in queue){
    			if(queue[i]["person"] == from){
    				deliveredNow(queue[i]);
    				delete queue[i];
    			}
    		}
    	}
    	if(message.toLowerCase() == "done" || message.toLowerCase() == "start"){
    		if(WSP.indexOf(from) >= 0){
    			if(WSPrequests.length != 0){
	    			submitRequestToIndividual(WSPrequests[0], from);
	    			WSPrequests.shift();
    			} else {
    				filledForNow(from);
    			}
    		} else if(Greenwich.indexOf(from) >= 0){
    			if(Greenwichrequests.length != 0){
	    			submitRequestToIndividual(Greenwichrequests[0], from);
	    			Greenwichrequests.shift();
    			} else {
    				filledForNow(from);
    			}
    		} else if(UnionSquare.indexOf(from) >= 0){
    			if(UnionSquarerequests.length != 0){
	    			submitRequestToIndividual(UnionSquarerequests[0], from);
	    			UnionSquarerequests.shift();
	    		} else {
	    			filledForNow(from);
	    		}
    		} else if(SOHO.indexOf(from) >= 0){
    			if(SOHOrequests.length != 0){
	    			submitRequestToIndividual(SOHOrequests[0], from);
	    			SOHOrequests.shift();
	    		} else {
	    			filledForNow(from);
	    		}
    		} else if(ThirdAve.indexOf(from) >= 0){
    			if(ThirdAverequests.length != 0){
	    			submitRequestToIndividual(ThirdAverequests[0], from);
	    			ThirdAverequests.shift();
	    		} else {
	    			filledForNow(from);
	    		}
    		} else if(Gramarcy.indexOf(from) >= 0){
    			if(Gramarcyrequests.length != 0){
	    			submitRequestToIndividual(Gramarcyrequests[0], from);
	    			Gramarcyrequests.shift();
	    		} else {
	    			filledForNow(from);
	    		}
    		}
    	}
    }
});
