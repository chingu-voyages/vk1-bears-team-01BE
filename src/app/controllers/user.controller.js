import userModel from "../models/user.model"



const userController = {};

userController.userInfo = (req, res) => {
    const userId = req.user._id;
    userModel.findById(userId).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json(user);
    });
};

userController.updateUser = (req, res) => {
    console.log(`This is user id -> ${req.user._id}`);
    // console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
    const { firstName, lastName, password, gender, country, region } = req.body;

    userModel.findOne({ _id: req.user._id }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: true,
                type: "danger",
                message: 'User not found'
            });
        }

        //firstName
        if (!firstName) {
            return res.status(400).json({
                error: true,
                type: "warning",
                message: 'First Name is required'
            });
        } else {
            user.firstName = firstName;
        }

        //lastName
        if (!lastName) {
            return res.status(400).json({
                error: true,
                type: "warning",
                message: 'Last Name is required'
            });
        } else {
            user.lastName = lastName;
        }

        //gender
        if (gender) {
            user.gender = gender;
        }

        //country
        if (country) {
            user.country = country;
        }

        //region
        if (region) {
            user.region = region;
        }

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    error: true,
                    type: "warning",
                    message: 'Password should be min 6 characters long'
                });
            } else {
                user.password = password;
            }
        }

        user.save((err, updatedUser) => {
            if (err) {
                console.log('USER UPDATE ERROR', err);
                return res.status(400).json({
                    error: true,
                    type: "danger",
                    message: 'User update failed'
                });
            }
            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json(updatedUser);
        });
    });
};

export default userController;