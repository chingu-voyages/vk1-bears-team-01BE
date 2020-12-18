import 'dotenv/config';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { validationResult } from 'express-validator';
import _ from 'lodash';
import httpStatus from "../utils/httpStatus";
import userModel from "../models/user.model";



// Mail google OAuth2
const oAuth2Client = new google.auth.OAuth2(process.env.MAIL_CLIENT_ID, process.env.MAIL_CLIENT_SECRET, process.env.MAIL_REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: process.env.MAIL_REFRESH_TOKEN })

// Google client id to OAuth2Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT);

const authController = {};

// REGISTER EMAIL
authController.register = async (req, res) => {
    const { firstName, lastName, email, password, gender, country, region } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Catch unexpected error
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            success: false,
            type: "danger",
            message: firstError
        });
    } else {
        // Checks if email exist
        await userModel.findOne({ email }).exec((err, user) => {
            if (user) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    error: true,
                    type: "warning",
                    message: "Email is already registered."
                });
            }
        });

        //FOR TOKEN BINDING
        const token = jwt.sign(
            {
                firstName, lastName, email, password, gender, country, region
            },
            process.env.JWT_ACCOUNT_ACTIVATION,
            {
                expiresIn: process.env.JWT_EXPIRATION
            }
        );

        // EMAIL FUNCTION
        const sendMail = async () => {
            try {
                const accessToken = await oAuth2Client.getAccessToken();

                // Nodemailer Setup
                const transport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: process.env.EMAIL_FROM,
                        clientId: process.env.MAIL_CLIENT_ID,
                        clientSecret: process.env.MAIL_CLIENT_SECRET,
                        refreshToken: process.env.MAIL_REFRESH_TOKEN,
                        accessToken: accessToken
                    }
                })
                // EMAIL CONTENT DETAILS
                const mailOptions = {
                    from: `LEXSELL <${process.env.EMAIL_FROM}>`,
                    to: email,
                    subject: 'Account Activation Link',
                    text: 'Please use the following to activate your account',
                    html: `<h1>Please use the following to activate your account</h1>
                            <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
                            <hr />
                            <p>This email may containe sensetive information</p>
                            <p>${process.env.CLIENT_URL}</p>`
                }
                // Sends the email
                const result = await transport.sendMail(mailOptions);
                return result;
            } catch (error) {
                return error;
            }
        }
        // Prompt for email success or failed.
        sendMail().then(result => {
            console.log('Email sent...', result);
            return res.json({
                success: true,
                type: "sucess",
                message: `Activation link has been sent to ${email}`
            });
        })
            .catch(error => {
                console.log(error.message)
                return res.json({
                    error: true,
                    type: "warning",
                    message: `Error: ${error.message}`
                });
            })

    }
}

// ACTIVATION
authController.activation = (req, res) => {
    const { token } = req.body;

    // Checks if has token
    if (token) {
        // Validate token
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
            if (err) {
                console.log('Activation error');
                // Return if token is expired
                return res.status(httpStatus.UNAUTHORIZED).json({
                    success: false,
                    type: "warning",
                    message: 'Expired link. Please register again'
                });
            } else {

                // Deconstruct token
                const { firstName, lastName, email, password, gender, country, region } = jwt.decode(token);

                // Assign details to user 
                const user = new userModel({
                    firstName, lastName, email, password, gender, country, region
                });

                // Save user to database
                user.save((err, user) => {
                    if (err) {
                        // Catch unexpected error
                        console.log('Save error -> ' + err);
                        return res.status(httpStatus.UNAUTHORIZED).json({
                            success: false,
                            type: "danger",
                            message: "Activation link already used. Please try to login."
                        });
                    } else {
                        // Activation Complete
                        return res.json({
                            success: true,
                            type: "sucess",
                            message: 'Activation Successful',
                            user: user
                        });
                    }
                });
            }
        });
    } else {
        // Catch Token Error
        return res.json({
            success: false,
            type: "warning",
            message: 'Error happening please try again'
        });
    }
};

// LOGIN
authController.login = (req, res,) => {
    // Deconstruct data from client form
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Catch unexpected error
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            success: false,
            type: "danger",
            message: firstError
        });
    } else {
        // Check if user exist
        userModel.findOne({ email }).exec((err, user) => {
            if (err || !user) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    type: "warning",
                    message: 'Account with that email does not exist. Please register.'
                });
            }
            // Authenticate
            if (!user.authenticate(password)) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    type: "warning",
                    message: 'Email and password do not match'
                });
            }
            // Generate a token and send to client
            const token = jwt.sign(
                {
                    _id: user._id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRATION
                }
            );

            // Deconstruct user data
            const { _id, firstName, lastName, email, role, gender, country, region } = user;

            // Login Success
            return res.json({
                success: true,
                type: "sucess",
                message: 'Login Successful',
                token,
                user: {
                    _id, firstName, lastName, email, role, gender, country, region
                }
            });
        });
    }
};

// FORGOT PASSWORD
authController.forgotPassword = (req, res) => {
    // Deconstruct email from client form
    const { email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Catch unexpected error
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            success: false,
            type: "danger",
            message: firstError
        });
    } else {
        // Check if user exist
        userModel.findOne({ email }, (err, user) => {
            if (err || !user) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    type: "warning",
                    message: 'Account with that email does not exist. Please register.'
                });
            }
            // Generate a token and send to client
            const token = jwt.sign(
                {
                    _id: user._id
                },
                process.env.JWT_RESET_PASSWORD,
                {
                    expiresIn: process.env.JWT_EXPIRATION
                }
            );

            // EMAIL CONTENT DETAILS
            const emailData = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: `Password Reset link`,
                html: `
                      <h1>Please use the following link to reset your password</h1>
                      <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                      <hr />
                      <p>This email may contain sensetive information</p>
                      <p>${process.env.CLIENT_URL}</p>
                  `
            };

            // Store reset password token to account
            return user.updateOne({ resetPasswordLink: token }, (err, success) => {
                if (err) {
                    console.log('RESET PASSWORD LINK ERROR', err);
                    return res.status(httpStatus.BAD_REQUEST).json({
                        success: false,
                        type: "danger",
                        message:
                            'Database connection error on user password forgot request'
                    });
                } else {
                    // SEND MAIL
                    sgMail
                        .send(emailData)
                        .then(sent => {
                            return res.json({
                                success: true,
                                type: "success",
                                message: `Email has been sent to ${email}. Follow the instruction to activate your account`
                            });
                        })
                        .catch(err => {
                            return res.json({
                                success: false,
                                type: "danger",
                                message: err.message
                            });
                        });
                }
            });
        });
    }
};

// RESET PASSWORD
authController.resetPassword = (req, res) => {

    // Deconstruct reset link and new password
    const { resetPasswordLink, newPassword } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Catch unexpected error
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            success: false,
            type: "danger",
            message: firstError
        });
    } else {
        // Checks if has resetPassword Link
        if (resetPasswordLink) {
            jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (
                err,
                decoded
            ) {
                if (err) {
                    // Reset link token is expired
                    return res.status(httpStatus.BAD_REQUEST).json({
                        success: false,
                        type: "danger",
                        message: 'Expired link. Please try again.'
                    });
                }

                // Find account with same reset password link
                userModel.findOne({ resetPasswordLink }, (err, user) => {
                    if (err || !user) {
                        // Catch unexpected error.
                        return res.status(httpStatus.BAD_REQUEST).json({
                            success: false,
                            type: "danger",
                            message: 'Something went wrong. Try later'
                        });
                    }

                    // Set update record
                    const updatedFields = {
                        password: newPassword,
                        resetPasswordLink: ''
                    };

                    //with Lodash
                    user = _.extend(user, updatedFields);

                    // Update database
                    user.save((err, result) => {
                        if (err) {
                            return res.status(httpStatus.BAD_REQUEST).json({
                                success: false,
                                type: "danger",
                                message: 'Error resetting user password'
                            });
                        }
                        // RESET SUCCESS
                        res.json({
                            success: true,
                            type: "success",
                            message: `Great! Now you can login with your new password`
                        });
                    });
                }
                );
            });
        }
    }
};


authController.googleLogin = async (req, res) => {
    // store the token from googleLogin
    const { tokenId } = req.body;
    client
        .verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT })
        .then(response => {
            // deconstruct data from google payload
            const { email_verified, given_name, family_name, email } = response.payload;
            if (email_verified) {
                //find if google email exist
                userModel.findOne({ email }).exec((err, user) => {
                    if (user) {
                        // Execute if user exist
                        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                            expiresIn: process.env.JWT_EXPIRATION
                        });
                        const { _id, firstName, lastName, email, role, gender, country, region } = user;
                        return res.json({
                            success: true,
                            type: "success",
                            message: `Google Login Successful`,
                            token,
                            user: { _id, firstName, lastName, email, role, gender, country, region }
                        });
                    } else {
                        // Create new record
                        let password = email + process.env.JWT_SECRET; // generate initial password
                        user = new userModel({ firstName: given_name, lastName: family_name, email: email, password, gender: '', country: '', region: '' });
                        user.save((err, data) => {
                            if (err) {
                                // Catch unexpected error
                                console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                                return res.status(httpStatus.BAD_REQUEST).json({
                                    success: false,
                                    type: "danger",
                                    message: 'User signup failed with google.'
                                });
                            }

                            // Token binding
                            const token = jwt.sign(
                                { _id: data._id },
                                process.env.JWT_SECRET,
                                { expiresIn: process.env.JWT_EXPIRATION }
                            );

                            // Deconstruct user data
                            const { _id, firstName, lastName, email, role, gender, country, region } = data;

                            // Google Login Success
                            return res.json({
                                success: true,
                                type: "success",
                                message: `Google Login Successful`,
                                token,
                                user: { _id, firstName, lastName, email, role, gender, country, region }
                            });
                        });
                    }
                });
            } else {
                // Email not verified or Something went wrong.
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    type: "danger",
                    message: 'Google login failed. Try again'
                });
            }
        });
};

export default authController;