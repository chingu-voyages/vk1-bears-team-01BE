import express from "express";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes"
import userRoutes from "./user.routes"
import chatRoutes from "./chat.routes"

const apiRoutes = express.Router();

//Default get on api (just for checking)
apiRoutes.get("/api", function (req, res, next) {
    res.json({ message: 'Welcome to Bears Team 1 Project!' });
});

//Use Routes
apiRoutes.use("/api/auth", authRoutes);

//product routes
apiRoutes.use("/api/product", productRoutes)

//user routes
apiRoutes.use("/api/user", userRoutes)

//chat routes
apiRoutes.use("/api/chat", chatRoutes);

export default apiRoutes;

