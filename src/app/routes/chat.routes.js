import express from "express";
import chatController from "../controllers/chat.controller"

const chatRoutes = express.Router();

chatRoutes.get("/", (req, res, next) => {
    res.json({ message: "API from chat." });
});

// trigger join-chat channel
chatRoutes.post("/join-chat", chatController.joinChat);

// authentication pusher channel credentials
chatRoutes.post("/pusher-auth", chatController.pusherAuth);

// routes for normal messages
chatRoutes.post("/send-message", chatController.sendMessage);

// routes for initial offer (no chat channel conversation)
chatRoutes.post("/initial-offer", chatController.initialOffer);

// routes for offer with existing chat channel
chatRoutes.post("/price-offer", chatController.priceOffer);

// routes for seller response to buyer's offer
chatRoutes.post("/seller-offer-response", chatController.sellerOfferResponse);

export default chatRoutes;