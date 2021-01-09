import express from "express";
import { asyncWrapper } from "./../utils/asyncWrapper";
import productController from "./../controllers/product.controller";
import authenticateToken from "../middlewares/auth";
const fileUpload = require('express-fileupload');


const productRoutes = express.Router();
productRoutes.use(fileUpload());
productRoutes.use(express.static('src'))
//get all product
productRoutes.get("/", asyncWrapper(productController.findAll));

//add product
productRoutes.post("/", authenticateToken, asyncWrapper(productController.add));

//update ppoduct
productRoutes.put("/:productId", authenticateToken, asyncWrapper(productController.update));

//get product by category
productRoutes.get(
  "/category/:category",
  asyncWrapper(productController.getCategory)
);

//get product
productRoutes.get("/:productId", asyncWrapper(productController.getProduct));

//get user product
productRoutes.get(
  "/userProduct/:userId",
  asyncWrapper(productController.getUserProduct)
);

productRoutes.post("/upload",asyncWrapper(productController.addImage))

//delete product
productRoutes.delete("/:productId",authenticateToken, asyncWrapper(productController.delete));

export default productRoutes;
