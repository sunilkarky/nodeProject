const dbConfig = require("../config/dbConfig");
const { Sequelize, DataTypes } = require("sequelize");

// la sequelize yo config haru lag ani database connect gardey vaneko hae 
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
//for localhost sql uses 3306 by default linxa yo cahi nalekhda huhnxa local host ma
// port:3306,
// yo port chai railway le deko pport for production
// port:7419,


  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("CONNECTED!!");
  })
  .catch((err) => {
    console.log("Error" + err);
  });

const db = {};

db.Sequelize = Sequelize;;
db.sequelize = sequelize;

// importing model files 
db.blogs = require("./blogModel.js")(sequelize, DataTypes);//blog table
db.users = require("./userModel.js")(sequelize, DataTypes);//user table   //yo name chai aafule j lekhda hunxa ani yo chai use garnu parxa uta app.js ma kam garnalai


db.sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync done");
});

module.exports = db;