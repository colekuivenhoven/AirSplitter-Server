const fs = require('fs');

// Functions
function dateTimeNow() {
    var currentDateTimeRaw = new Date(); 
    var currentDateTimeFormatted = (currentDateTimeRaw.getMonth()+1)+'/'+
                                (currentDateTimeRaw.getDate())+'/'+
                                (currentDateTimeRaw.getFullYear())+' '+
                                (currentDateTimeRaw.getHours())+':'+
                                (currentDateTimeRaw.getMinutes())+':'+
                                (currentDateTimeRaw.getSeconds())+' ';
    return currentDateTimeFormatted;
}

function logConnectionRecord(page, ip, requestType) {
    // console.log(dateTimeNow()+'[Request '+requestType+'] ('+ip+') <'+page+'>');
    console.log(dateTimeNow()+'[Request '+requestType+'] <'+page+'>');
    // writeToLog(dateTimeNow()+'[Request '+requestType+'] ('+ip+') <'+page+'>');
    writeToLog(dateTimeNow()+'[Request '+requestType+'] <'+page+'>');
}

function writeToLog(content) {
    var currentDateTimeRaw = new Date(); 
    var currentDateTimeFormatted = (currentDateTimeRaw.getMonth()+1)+'_'+
                                (currentDateTimeRaw.getDate())+'_'+
                                (currentDateTimeRaw.getFullYear());
    fs.writeFile('./logs/'+currentDateTimeFormatted+'.txt', content+'\n', { flag: 'a+' }, error => {
        if(error) {
            console.log(error);
            return;
        }
    })
}

module.exports = {dateTimeNow, logConnectionRecord, writeToLog}