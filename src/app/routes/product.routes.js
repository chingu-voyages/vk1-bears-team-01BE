import express from "express";
import { asyncWrapper } from "./../utils/asyncWrapper";
import productController from "./../controllers/product.controller";
import authenticateToken from "../middlewares/auth";

const productRoutes = express.Router();

//get all product
productRoutes.get("/", asyncWrapper(productController.findAll));

//add product
productRoutes.post("/", authenticateToken, asyncWrapper(productController.add));

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

//delete product
productRoutes.delete("/:productId",authenticateToken, asyncWrapper(productController.delete));

export default productRoutes;
