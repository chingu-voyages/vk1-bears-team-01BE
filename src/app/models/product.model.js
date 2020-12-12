import mongoose from "mongoose";

const schema = mongoose.Schema;

const productSchema = new schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
  },
  category: {
    type: Array,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  meetingPlace: {
    type: String,
  },
  brand:{
    type: String,
    default: "No Brand"
  },
  likes: {
    type: Number,
    default: 0,
  },
  condition:{
    type: String,
    default: "Brand new"
  },
  isSold:{
    type:Boolean,
    default:false
  },
  createdAt:{
    type:Date,
    required:true
  },
  updatedAt:{
    type:Date
  }
});

const productModel = mongoose.model("product", productSchema);
export default productModel;
