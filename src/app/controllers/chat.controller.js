import 'dotenv/config';
import Pusher from "pusher";
import channelModel from "../models/channel.model"
import messageModel from "../models/message.model"
import httpStatus from "../utils/httpStatus";
import pusherTrigger from "../utils/pusherTrigger";

const chatController = {};

// pusher Config
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
});

// Join Chat Channel (not yet used)
chatController.joinChat = (req, res) => {
    req.session.username = req.body.username;
    res.json("Joined");
}

// Pusher Channel Setup from front-end
chatController.pusherAuth = (req, res) => {
    var socketId = req.body.socket_id;
    var channel = req.body.channel_name;
    var auth = pusher.authenticate(socketId, channel);
    res.send(auth);
}

// For Regular Chat Messages
chatController.sendMessage = async (req, res) => {
    // deconstruct data for easy use
    const { channel, productId, buyerId, sellerId, priceOffer, buyerDeal, sellerDeal, senderId, message, messageType } = req.body;

    // timestamp initialization format sample -> '2020-12-30 18:22:23'
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const createdAt = timestamp;
    const updatedAt = timestamp;

    try {
        if (channel) {
            channelModel.findOne({ channel }).exec(async (err, hasChannel) => {
                if (hasChannel) {

                    // Executes if channel is existing
                    // Setup message details
                    const messageDetails = await messageModel.create({
                        channel,
                        senderId,
                        message,
                        messageType,
                        timestamp
                    });
                    // Save message details
                    messageDetails.save(async (err, messageDetails) => {
                        if (err) {
                            // Catch unexpected error
                            console.log('Message save error -> ' + err);
                            return res.status(httpStatus.UNAUTHORIZED).json({
                                success: false,
                                type: "danger",
                                message: `Error Message: ${err}`
                            });
                        } else {
                            // Execute pusherTrigger function from Utils
                            pusherTrigger(req, timestamp);

                            // Updates timestamp on channel updatedAt
                            await channelModel.findOneAndUpdate({ channel }, { updatedAt: timestamp });

                            //return success response
                            return res.json({
                                success: true,
                                type: "success",
                                message: 'Message has been posted',
                                messageInfo: messageDetails
                            });
                        }
                    })
                } else {
                    // Execute if Channel does not exist
                    // Setup channel details
                    const channelDetails = await channelModel.create({
                        channel,
                        productId,
                        buyerId,
                        sellerId,
                        priceOffer,
                        buyerDeal,
                        sellerDeal,
                        createdAt,
                        updatedAt
                    });
                    // Save channel details
                    channelDetails.save(async (err, channelDetails) => {
                        if (err) {
                            // Catch unexpected error
                            console.log('Channel save error -> ' + err);
                            return res.status(httpStatus.UNAUTHORIZED).json({
                                success: false,
                                type: "danger",
                                message: `Error Message: ${err}`
                            });
                        } else {
                            // Setup message details
                            const messageDetails = await messageModel.create({
                                channel,
                                senderId,
                                message,
                                messageType,
                                timestamp
                            });
                            // Save message details
                            messageDetails.save((err, messageDetails) => {
                                if (err) {
                                    // Catch unexpected error
                                    console.log('Message save error -> ' + err);
                                    return res.status(httpStatus.UNAUTHORIZED).json({
                                        success: false,
                                        type: "danger",
                                        message: `Error Message: ${err}`
                                    });
                                } else {
                                    // Update Pusher Chat Server
                                    pusherTrigger(req, timestamp);

                                    //return success response
                                    return res.json({
                                        success: true,
                                        type: "success",
                                        message: 'Message has been posted',
                                        channelInfo: channelDetails,
                                        messageInfo: messageDetails
                                    });
                                }
                            })
                        }
                    });
                }
            })
        } else {
            // Execute if channel is Empty
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                type: "danger",
                message: `Channel is Undefined.`
            });
        }
    } catch (error) {
        // Catch unexpected error
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ error: error.toString() });
    }
}

// For Initial Price Offer from Product Page 
chatController.initialOffer = async (req, res) => {
    // deconstruct data for easy use
    const { channel, productId, buyerId, sellerId, priceOffer, buyerDeal, sellerDeal, senderId, message, messageType } = req.body;

    // timestamp initialization format sample -> '2020-12-30 18:22:23'
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const createdAt = timestamp;
    const updatedAt = timestamp;

    // Setup channel details
    const channelDetails = await channelModel.create({
        channel,
        productId,
        buyerId,
        sellerId,
        priceOffer,
        buyerDeal,
        sellerDeal,
        createdAt,
        updatedAt
    });

    // Save channel details
    channelDetails.save(async (err, channelDetails) => {
        if (err) {
            // Catch unexpected error
            console.log('Channel save error -> ' + err);
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                type: "danger",
                message: `Error Message: ${err}`
            });
        } else {
            // Setup message details
            const messageDetails = await messageModel.create({
                channel,
                senderId,
                message,
                messageType,
                timestamp
            });

            // Save message details
            messageDetails.save((err, messageDetails) => {
                if (err) {
                    // Catch unexpected error
                    console.log('Message save error -> ' + err);
                    return res.status(httpStatus.UNAUTHORIZED).json({
                        success: false,
                        type: "danger",
                        message: `Error Message: ${err}`
                    });
                } else {
                    // Update Pusher Chat Server
                    pusherTrigger(req, timestamp);

                    //return success response
                    return res.json({
                        success: true,
                        type: "success",
                        message: 'Offer has been sent',
                        channelInfo: channelDetails,
                        messageInfo: messageDetails
                    });
                }
            })
        }
    });
}

// For Price Offer from Chat Conversation
chatController.priceOffer = async (req, res) => {
    // deconstruct data for easy use
    const { channel, priceOffer, buyerDeal, senderId, message, messageType } = req.body;

    // timestamp initialization format sample -> '2020-12-30 18:22:23'
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Setup message details
    const messageDetails = await messageModel.create({
        channel,
        senderId,
        message,
        messageType,
        timestamp
    });
    // Save message details
    messageDetails.save(async (err, messageDetails) => {
        if (err) {
            // Catch unexpected error
            console.log('Message save error -> ' + err);
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                type: "danger",
                message: `Error Message: ${err}`
            });
        } else {
            // Update Pusher Chat Server
            pusherTrigger(req, timestamp);

            // Updates timestamp, priceOffer and buyerDeal on channel record
            await channelModel.findOneAndUpdate({ channel }, { updatedAt: timestamp, priceOffer: priceOffer, buyerDeal: buyerDeal });

            //return success response
            return res.json({
                success: true,
                type: "success",
                message: 'Offer has been sent',
                messageInfo: messageDetails
            });
        }
    })
}

// For Seller Price Offer Response to Buyer
chatController.sellerOfferResponse = async (req, res) => {
    // deconstruct data for easy use
    const { channel, sellerDeal, senderId, message, messageType } = req.body;

    // timestamp initialization format sample -> '2020-12-30 18:22:23'
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Setup message details
    const messageDetails = await messageModel.create({
        channel,
        senderId,
        message,
        messageType,
        timestamp
    });

    // Save message details
    messageDetails.save(async (err, messageDetails) => {
        if (err) {
            // Catch unexpected error
            console.log('Message save error -> ' + err);
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                type: "danger",
                message: `Error Message: ${err}`
            });
        } else {
            // Update Pusher Chat Server
            pusherTrigger(req, timestamp);

            // Updates timestamp and sellerDeal on channel record
            await channelModel.findOneAndUpdate({ channel }, { updatedAt: timestamp, sellerDeal: sellerDeal });

            //return success response
            return res.json({
                success: true,
                type: "success",
                message: message,
                messageInfo: messageDetails
            });
        }
    })
}



export default chatController;