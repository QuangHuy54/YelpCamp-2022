if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}


const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const ExpressError=require('./utils/ExpressError');
const methodOverride=require('method-override');
const session=require('express-session');
const flash=require('connect-flash'); 
const passport=require('passport');
const LocalStrategy=require('passport-local');
const mongoSanitize=require('express-mongo-sanitize');
const User=require('./models/user');
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/review');
const userRoutes=require('./routes/users');
const helmet=require('helmet');
const MongoStore=require('connect-mongo');
const dbUrl=process.env.DB_URL||'mongodb://127.0.0.1:27017/yelp-camp';

mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MONGO CONNECTION OPEN!!!")
})
.catch(err => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!")
    console.log(err)
})
const db=mongoose.connection;
app.engine('ejs',ejsMate);

const secret=process.env.SECRET||'thisisasecret';
const store=MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24*60*60
});
store.on("error",function(e){
    console.log("SESSION STORE ERROR",e);
});
const senssionConfig={
    store,
    name:'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
    },
}

app.use(helmet({
    crossOriginResourcePolicy:false,
    crossOriginOpenerPolicy:false,
    crossOriginEmbedderPolicy:false
}));
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://cdn.jsdelivr.net"
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dq39u0u7r/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(mongoSanitize({
    replaceWith:'_'
}));
app.use(session(senssionConfig));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/reviews",reviewRoutes);
app.use('/',userRoutes);

app.get('/',(req,res)=>{
    res.render('home');
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})
app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message){
        err.message='Something went wrong';
    }
    res.status(statusCode).render('error',{err});
})
const port=process.env.PORT||3000;
app.listen(port,()=>{
    console.log(`Serving on port ${port}`)
})