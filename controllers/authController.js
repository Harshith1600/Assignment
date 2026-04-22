const {check, validationResult}=require('express-validator')
const User=require('../models/user');
const bcrypt=require('bcryptjs');

exports.getLogin=(req,res,next)=>{
  res.render("auth/login",{
    isLoggedIn:false,
    pageTitle:"Login",
    currentPage:"login",
    err:[],
    oldInput:{email:""},
    user:{}
  })
}

exports.postLogin=async (req,res,next)=>{
  const {email,password}=req.body;
  const user=await User.findOne({email});
  if(!user){
    return res.render('auth/login',{
      pageTitle:'Login',
      currentPage:'login',
      isLoggedIn:false,
      err:['Invalid Email'],
      oldInput:{email},
      user:{}
    });
  }
  const isMatch=await bcrypt.compare(password,user.password);
  if(!isMatch){
    return res.render('auth/login',{
      pageTitle:'Login',
      currentPage:'login',
      isLoggedIn:false,
      err:['Invalid Password'],
      oldInput:{email},
      user:{}
    });
  }
  req.session.isLoggedIn=true;
  req.session.user=user;
  await req.session.save();
  res.redirect('/profile');
}

exports.getSignup=(req,res,next)=>{
  res.render("auth/signup",{
    isLoggedIn:false,
    pageTitle:"signup",
    currentPage:"signup",
    err: [],
    oldInput:{firstName:'',lastName:'',email:'',password:''},
    user:{}
  })
}

exports.postSignup=[
  check('firstName').notEmpty().withMessage('First Name is required').trim().isLength({min:2}).withMessage('First name must be atleast 2 charachters long').matches(/^[a-zA-Z\s]+$/).withMessage('First Name Can only contail Letters'),
  check('lastName').matches(/^[a-zA-Z\s]+$/).withMessage('First Name Can only contail Letters'),
  check('email').isEmail().withMessage('Please Enter a valid Email'),
  check('password').isLength({min:5}).withMessage('Password must be at least 5 characters long').matches(/[a-z]/).withMessage('Password must contain atleast one lowercase letter').matches(/[A-Z]/).withMessage('Password Must contain atleast one uppercase Letter').matches(/[!@#$%^&*(){}|<>]/).withMessage('Password must contain at least one special character').trim(),
  check('confirmPassword').trim().custom((val,{req})=>{
    if(val!==req.body.password){
      throw new Error('Password do not match');
    }
    return true;
  }),
  check('termsAccepted').not().isEmpty().withMessage('You must Accept the terms and conditions'),
  async (req,res,next)=>{
    try {
      const {firstName,lastName,email,password}=req.body;
      const errors=validationResult(req);

      if(!errors.isEmpty()){
        return res.status(422).render('auth/signup',{
          pageTitle:'Sign Up',
          isLoggedIn:false,
          currentPage:'signup',
          err:errors.array().map(error=>error.msg),
          oldInput:{
            firstName,lastName,email,password
          },
          user:{}
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword
      });

      await user.save();
      return res.redirect('/login');
    } catch (err) {
      console.log("Error in postSignup: ", err);
      const msg = (err && err.code === 11000) ? 'Email already exists' : 'Error creating account';
      return res.status(500).render('auth/signup',{
        pageTitle:'Sign Up',
        isLoggedIn:false,
        currentPage:'signup',
        err:[msg],
        oldInput:{ firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, password: '' },
        user:{}
      });
    }
  }
]


exports.getProfile = (req, res, next) => {
  if (!req.isLoggedIn) {
    return res.redirect('/login');
  }
  const user = req.session.user;
  res.render('user/user', {
    pageTitle: 'Profile',
    currentPage: 'profile',
    isLoggedIn: true,
    user: user,
    err: []
  });
};

exports.postProfile = async (req, res, next) => {
  if (!req.isLoggedIn) {
    return res.redirect('/login');
  }
  const { firstName, lastName, dob, address, hobbies } = req.body;
  const hobbiesArray = hobbies ? hobbies.split(',').map(h => h.trim()) : [];
  try {
    await User.findByIdAndUpdate(req.session.user._id, {
      firstName,
      lastName,
      dob: dob ? new Date(dob) : undefined,
      address,
      hobbies: hobbiesArray
    });
    // Update session user
    req.session.user.firstName = firstName;
    req.session.user.lastName = lastName;
    req.session.user.dob = dob ? new Date(dob) : undefined;
    req.session.user.address = address;
    req.session.user.hobbies = hobbiesArray;
    res.redirect('/profile');
  } catch (err) {
    console.log(err);
    res.render('user/user', {
      pageTitle: 'Profile',
      currentPage: 'profile',
      isLoggedIn: true,
      user: req.session.user,
      err: ['Error updating profile']
    });
  }
};

exports.postLogout=(req,res,next)=>{
  //res.cookie("isLoggedIn",false);
  req.session.destroy(()=>{
    res.redirect("/login");
  })
}
