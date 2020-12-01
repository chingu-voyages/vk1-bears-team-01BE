import 'dotenv/config';
import mongoose from "mongoose";

mongoose.Promise = global.Promise;
const connectDB = () => {
    return mongoose.connect(process.env.DATABASE_URL, {
        //the following lines is for DeprecationWarning
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log("Database connected sucessfully !");
    },
        error => {
            console.log('Database could not be connected, ' + error)
        });
}

export default connectDB;
