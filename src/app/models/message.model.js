import mongoose from "mongoose";

const schema = mongoose.Schema;

const messageSchema = new schema({
    // channelId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true,
    //     ref: "channels",
    // },
    // senderId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true,
    //     ref: "users",
    // },
    channel: {
        type: String,
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },

    messageType: {
        type: String,
        required: true
    },

    timestamp: {
        type: String,
        required: true
    }
});

const messageModel = mongoose.model("message", messageSchema);
export default messageModel;
