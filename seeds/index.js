if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

const mongoose=require('mongoose');
const Campground=require('../models/campground');
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');

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
const sample =(array)=>array[Math.floor(Math.random()*array.length)];
const seedDB=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<200;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author:'630ee0274eb464c317de638f',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum magnam minus necessitatibus quos quia, ipsum expedita voluptates voluptatibus, quidem reiciendis corrupti eaque unde iusto ex officia a eos nostrum voluptate.',
            price,
            geometry:{
                type:"Point",
                coordinates:[cities[random1000].longitude,cities[random1000].latitude],
            },
            images:[
                {
                    url: 'https://res.cloudinary.com/dq39u0u7r/image/upload/v1661535296/YelpCamp/u429testycmjy6dlww8w.jpg',
                    filename: 'YelpCamp/u429testycmjy6dlww8w'
                },
                {
                    url: 'https://res.cloudinary.com/dq39u0u7r/image/upload/v1661535250/YelpCamp/uuy4dducibljpznxwe1u.jpg',
                    filename: 'YelpCamp/uuy4dducibljpznxwe1u'
                }
            ]
        })
        await camp.save()
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
})