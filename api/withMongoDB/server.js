require("dotenv").config();

const express = require("express");
const connectDB = require("../../db/mongo");
const MessageModel = require("../../models/Message");

connectDB();

const app = express();
app.use(express.json());

app.get("/search", async (req, res) => {
    try{
        const {word, limit} = req.query;

        if(!word){
            return res.status(400).json({error: "Word is required!"});
        }else if(!limit){
            return res.status(400).json({error: "Limit is required!"});
        }

        const messages = await MessageModel.find({
            content: { $regex: word, $options: "i"},
            $expr: { $gt: [{$strLenCP: "$content"}, Number(limit)]}
        }).select("messageId content");

        res.json(messages);

    }catch(err){
        res.status(500).json(error);
    }
})

app.listen(process.env.PORT, () => {
    console.log('App is running on', process.env.PORT);
});
