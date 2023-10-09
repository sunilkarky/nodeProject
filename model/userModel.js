module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", { //blog is name of table in database in plurar form ma basxa
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

      //for otp validation and verification 
      otp:{
        type:DataTypes.STRING,
        allowNull:true
      },
      otpGenerateTime:{
        type:DataTypes.STRING,
        allowNull:true
      }
      
    
    });
    return User;
  };