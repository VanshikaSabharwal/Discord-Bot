require("dotenv").config();
const {Client, GatewayIntentBits} = require("discord.js");
const MessageModel = require("../../models/Message");
const connectDB = require("../../db/mongo")

connectDB();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
})

client.on("messageCreate", async (message) => {
if(message.author.bot) return;

try{
    await MessageModel.create({
        messageId: message.id,
        guildId: message.guild,
        channelId: message.channelId,
        content: message.content,
        authorId: message.authorId,
        createdAt: message.createdAt
    })
}catch(err){
    console.log("Error: ", err);
}

if(message.content == "ping"){
    message.reply("pong");
}
});

client.login(process.env.DISCORD_TOKEN);