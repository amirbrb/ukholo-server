const helpDataService = require('../dataServices/helpDataService');
const moment = require('moment')

module.exports = function(io, socket){
    let module = {}
    module.connect = function(){
        console.log('user connected');
    };
    
    module.disconnect = function(){
        console.log('user disconnected');
    };
    
    module.connectToChat = function(caseId){
        socket.join(caseId);
    }
    
    module.messageRecieved = function(postData){
        let caseId = postData.caseId;
        let message = postData.message;
        let sender = postData.sender;
        var timestamp = moment().format();
        helpDataService.addCaseMessage(caseId, message, sender, timestamp)
            .then(response => {
                io.to(caseId).emit('chat-message', {
                    text: message, senderId: sender, timestamp: timestamp
                });
            })
            .catch(err => {
                //CRA: log
            })
    };
    
    return module;
}

