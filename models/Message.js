const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    messageId: String,
    guildId: String,
    channelId: String,
    content: String,
    authorId: String,
    createdAt: Date 
});

module.exports = mongoose.model("Message", messageSchema);