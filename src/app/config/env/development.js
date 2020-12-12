const devConfig = {
    //database
    jwt_key: process.env.JWT_SECRET,
    jwt_expiration: 360000,
    dbConnectionString: `mongodb://localhost:27017/bt1`,
    mongoDebug: true
  };
  
  export default devConfig;
  
  