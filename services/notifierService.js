const gcm = require('node-gcm');
const apiKey = "AAAAzKfpeRE:APA91bHVh54ak3p4-XOi6mFMeze5EzFvSMiOsjJt5zrXrh0wec5cY1er6V5HHQsFW-q_iqyqG_iOSe6lF9ICILlACto6AZHFgXl8J_Hgjt5kE0x0ocIU4A8EvpISPSS6oC4h_4BM4I76";

module.exports = {
    notifyEventMessage(ownerRegistrationId, caseData) {
        this.sendMessage([ownerRegistrationId], 'new message', 'a new message is waiting for you about ' + caseData.title);
    },
    notifyEvent(closeUsersIds, caseData) {
        this.sendMessage(closeUsersIds, 'someone needs help', 'your help is needed, take a look');
    },
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
