import express from "express";
import userController from "../controllers/user.controller"
import authenticateToken from "../middlewares/auth";
import { asyncWrapper } from "../utils/asyncWrapper";
import {
    validRegister,
    validLogin,
    forgotPasswordValidator,
    resetPasswordValidator
} from "../middlewares/validation";

const userRoutes = express.Router();

userRoutes.get("/", function (req, res, next) {
    res.json({ message: "API from User." });
});

// GET User
userRoutes.get("/getInfo", authenticateToken, asyncWrapper(userController.userInfo));

// UPDATE User
userRoutes.post('/update', authenticateToken, asyncWrapper(userController.updateUser));



export default userRoutes;