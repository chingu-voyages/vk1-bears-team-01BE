import "dotenv/config";
import httpStatus from "./../utils/httpStatus";
import productModel from "./../models/product.model";

const productController = {};

//add product
productController.add = async (req, res) => {
  //const userId = req.user.userId;
  console.log("product controller")
  console.log(req.body)
  console.log(req.user._id)
  const {
    title,
    description,
    images,
    category,
    price,
    meetingPlace,
    brand,
    condition,
  } = req.body;
  const userId = req.user._id;
  const today = new Date();
  try {
    const product = await productModel.create({
      title,
      description,
      userId,
      images,
      category,
      price,
      meetingPlace,
      condition,
      brand,
      createdAt: today,
    });
    await product.save();
    return res.status(httpStatus.OK).json({ message: "successfully added" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: error.toString() });
  }
};

//get user product
productController.getUserProduct = async (req, res) => {
  try {
    const userid = req.params.userId;
    const products = await productModel.find();
    const userProducts = products.filter((product) => product.userId == userid);
    if(products) return res.status(httpStatus.OK).json(userProducts);
    else return res.status(httpStatus.NO_CONTENT).json({meesage: "no content"});
  } catch (error) {
    return res.status().json({ error: error.toString() });
  }
};

//get product by category
productController.getCategory = async (req, res) => {
  try {
    let products = await productModel.find();
    const category = req.params.category;
    let productsCategory = products.filter((product) =>
      product.category.includes(category)
    );
    return res.json(productsCategory);
  } catch (error) {
    return res.status().json({ error: error.toString() });
  }
};

//get product by id
productController.getProduct = async (req, res) => {
  try {
    let product = await productModel.findById(req.params.productId);
    if (!product) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    return res.status().json({ error: error.toString() });
  }
};

//Delete product
productController.delete = async (req, res) => {
  try {
    const product = await productModel.findByIdAndRemove(req.params.productId);
    if (!product) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Item not found" });
    }
    return res.json({ message: "Item deleted successfully!" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: error.toString() });
  }
};

//get all product
productController.findAll = async (req, res) => {
  try {
    let products = await productModel.find();
    return res.json(products);
  } catch (error) {
    return res.status().json({ error: error.toString() });
  }
};



export default productController;