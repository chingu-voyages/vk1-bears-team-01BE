import express from "express";
import authController from "../controllers/auth.controller"
import { asyncWrapper } from "../utils/asyncWrapper";
import {
    validRegister,
    validLogin,
    forgotPasswordValidator,
    resetPasswordValidator
} from "../middlewares/validation";

const authRoutes = express.Router();

authRoutes.get("/", function (req, res, next) {
    res.json({ message: "API from auth." });
});

// Create
authRoutes.post("/register", validRegister, asyncWrapper(authController.register));
// Activation
authRoutes.post('/activation', asyncWrapper(authController.activation));
// Login
authRoutes.post("/login", validLogin, asyncWrapper(authController.login));
// Forgot Reset password
authRoutes.put('/forgotpassword', forgotPasswordValidator, asyncWrapper(authController.forgotPassword));
authRoutes.put('/resetpassword', resetPasswordValidator, asyncWrapper(authController.resetPassword));


// Google Login
authRoutes.post("/googlelogin", asyncWrapper(authController.googleLogin));


export default authRoutes;