import mongoose from "mongoose";

const schema = mongoose.Schema;

const channelSchema = new schema({
    channel: {
        type: String,
        required: true,
    },
    productId: {
        type: String,
        required: true,
    },
    buyerId: {
        type: String,
        required: true,
    },
    sellerId: {
        type: String,
        required: true,
    },
    priceOffer: {
        type: Number,
        required: true,
    },
    buyerDeal: {
        type: Boolean,
        default: 'false'

    },
    sellerDeal: {
        type: Boolean,
        default: 'false'
    },
    createdAt: {
        type: String,
        required: true,
    },
    updatedAt: {
        type: String,
        required: true,
    }
});

const channelModel = mongoose.model("channel", channelSchema);
export default channelModel;
