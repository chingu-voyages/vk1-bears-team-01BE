import Pusher from "pusher";

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
});

// Update Pusher Server
const pusherTrigger = (req, timestamp) => {
    const { channel, productId, buyerId, sellerId, priceOffer, buyerDeal, sellerDeal, senderId, message, messageType } = req.body;
    pusher.trigger("chat-channel-" + channel, "message_sent", {
        channel: channel,
        productId: productId,
        buyerId: buyerId,
        sellerId: sellerId,
        priceOffer: priceOffer,
        buyerDeal: buyerDeal,
        sellerDeal: sellerDeal,
        senderId: senderId,
        message: message,
        messageType: messageType,
        timestamp: timestamp
    });
}

export default pusherTrigger;
