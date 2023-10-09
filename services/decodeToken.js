const jwt=require("jsonwebtoken")

// const promisify=require("util").promisify//cookie sction ma error haldle garna 
// const promisify=require("util").promisify
const {promisify}=require("util")

exports.decodeToken=async(token,secret)=>{
    const decryptedResult=await promisify(jwt.verify)(token,process.env.SECRETKEY)
    return decryptedResult
}