module.exports = {
    parseSearchArgs: function (message){
        // expect first str to be command
        var keywords = message.split(" ");
        if (keywords.length > 1)
            return keywords.splice(1);
        return 0
    }
}