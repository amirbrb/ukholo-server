const gcm = require('node-gcm');
const apiKey = "AAAAzKfpeRE:APA91bHVh54ak3p4-XOi6mFMeze5EzFvSMiOsjJt5zrXrh0wec5cY1er6V5HHQsFW-q_iqyqG_iOSe6lF9ICILlACto6AZHFgXl8J_Hgjt5kE0x0ocIU4A8EvpISPSS6oC4h_4BM4I76";

//var deviceID = "eeI1Cf5QY58:APA91bEbxYWnUVv4xGCwFukRsLCOcbTRw4vKLfN6Hkkf85jXPTju_ikLUV309a9dq39ZrVG9G6-1jHByapw3bM3Glbfxbf2j7h8_ZCxE1CSxonHJuA65FHaKJwIi65cVtkIJYqx8Scfu";
//devices should be an array of device ids

//sendMessage(["AAAAzKfpeRE:APA91bHVh54ak3p4-XOi6mFMeze5EzFvSMiOsjJt5zrXrh0wec5cY1er6V5HHQsFW-q_iqyqG_iOSe6lF9ICILlACto6AZHFgXl8J_Hgjt5kE0x0ocIU4A8EvpISPSS6oC4h_4BM4I76"]);

module.exports = {
    sendMessage(devices, title, body) {
        var service = new gcm.Sender(apiKey);
        var message = new gcm.Message();
        message.addData('message', body);
        message.addData('title', title);
        message.addData('sound', 'default');
        message.timeToLive = 3000

        service.send(message, { registrationTokens: devices }, function(err, response) {
            if (err) console.error(err);
            else console.log(response);
        });
    }
}
