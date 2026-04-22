const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
  firstName:{type:String,required:true},
  lastName:{type:String,required:true},
  email:{type:String,required:true,unique:true},
  password:{type:String,required:true},
  usertype:{type:String,enum:['guest','host'],default:'guest'},
  dob:{type:Date},
  address:{type:String},
  hobbies:{type:[String]},
});

module.exports=mongoose.model('User',userSchema)