const path = require('path');
const express = require('express');
const errorController=require('./controllers/errors');
const { authRouter } = require("./routes/authRouter");
const { default: mongoose } = require('mongoose');
const app = express();
const session=require('express-session');
const MongoDBStore=require('connect-mongodb-session')(session);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const load_env = require('./utils/load_env');
load_env();
const DB_PATH = process.env.DB_PATH;
const store=new MongoDBStore({
  uri:DB_PATH,
  collection:'session'
})

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret:'DekNek',
  resave:false,
  saveUninitialized:true,
  store:store
}))
app.use((req,res,next)=>{
  req.isLoggedIn=req.session.isLoggedIn;
  next();
})

// Root route: render a simple homepage
app.get('/', (req, res) => {
  res.render('home', {
    pageTitle: 'Home',
    currentPage: 'home',
    isLoggedIn: req.isLoggedIn,
    user: req.session ? req.session.user || {} : {},
    err: []
  });
});

app.use(authRouter);

app.use(errorController.get404);

const port = process.env.PORT || 3004;



mongoose.connect(DB_PATH).then(()=>{
  app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  });
}).catch((err)=>{
  console.log("Error while Connecting to Moongose",err);
});
