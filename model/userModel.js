module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", { //blog is name of table in database in plurar form
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull : false
      },
      password: {
        type: DataTypes.STRING,
        allowNull:false
      },
      
    
    });
    return User;
  };