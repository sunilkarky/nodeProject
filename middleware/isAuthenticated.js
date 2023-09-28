// const { JsonWebTokenError, decode } = require("jsonwebtoken")
const jwt=require("jsonwebtoken")

// const promisify=require("util").promisify//cookie sction ma error haldle garna 
// const promisify=require("util").promisify
const {promisify}=require("util")
const { users } = require("../model")

exports.isAuthenticated=async(req,res,next)=>{
    console.log(req.cookies.token)
    const token=req.cookies.token //suruko var second uta k nam xa hamro browser ma token
    //check if token is provided from above code serverside validation ni garnu paro
    if(!token){
        return res.send("Token xaina i.ie no login be provided .please login first to add blogs")
    }
    // JsonWebTokenError.verify(token,process.env.SECRETKEY,(error,decode))
    // const decryptedResult=await promisify(jwt.verify)(token,process.env.SECRETKEY)
    //thhis json web token leverify garna .verify vanne method dinxa to verify
    const decryptedResult=await promisify(jwt.verify)(token,process.env.SECRETKEY)//yahi var token
    
    console.log(decryptedResult)//yaha samman chai hamro cookie decryptedResult samman id ani aaru  exp harub k k aaipugo cookie ma pathako aaipugyo tara aba verify ni garnu paro if exist in our table ki aafai jptcookie ho


    //check if that user exist with that id in our table 
    const usersExist=await users.findAll({
        where:{
            id:decryptedResult.id
        }
    })

    // console.log(usersExist) //yasma chai if user exist xa vane chai array vitra object aauxa
    //check  garda ki user xaki xaina we use if the length is zero ie exist ornot

    if(usersExist.length==0){
        res.send("User Doesnot Exist")
    }
        else{ //if user xa vane // ejs ma pathako jastai middleware bata ni pass garera pathauna sakinxa
            req.user=usersExist; ///yo chai sab array nai pathako hamro yo middle ware bata hamro creatblog ma now you can access using req.user[0] /or descryptedResult.id
            // req.userId=usersExist[0].id
            next(); //success vanne else block ma xa so success vayesi next ma jane tyo uta controller ma xa
                    //next hunxa if mathiko all condition satisfy i.e legit ho then creatblog grna dine
        }
    }
//next()
