
// for local machine host

module.exports = {
     HOST: "localhost",
     USER: "root",
     PASSWORD: "",
     DB: "sepcms", ///dbname
     dialect: "mysql",//db type
     pool: {
       max: 5,
       min: 0,
       acquire: 30000,
       idle: 10000,
     },
   };



  //  module.exports = {
  //   HOST: "containers-us-west-127.railway.app",
  //   USER: "root",
  //   PASSWORD: "L3OLo4Gl12fKWSblCjqS",
  //   DB: "railway", ///dbname
  //   dialect: "mysql",//db type
  //   pool: {
  //     max: 5,
  //     min: 0,
  //     acquire: 30000,
  //     idle: 10000,
  //   },
  // };