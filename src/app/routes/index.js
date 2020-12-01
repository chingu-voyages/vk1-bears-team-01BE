import express from "express";


const apiRoutes = express.Router();

//Default get on api (just for checking)
apiRoutes.get("/api", function (req, res, next) {
    res.json({ message: 'Welcome to Bears Team 1 Project!' });
});



export default apiRoutes;
