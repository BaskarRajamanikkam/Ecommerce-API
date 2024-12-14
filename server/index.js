const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cloudinary = require('cloudinary');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const cronJob = require('./utils/cronJob');

const connectDB = require('./config/database');
const errorMiddleware = require('./middleware/error');

const PORT  = process.env.PORT || 5000;

const app = express();

//config
require('dotenv').config({ path : 'server/config/.env'});



app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());


// UncaughtException Error
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});


connectDB();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const user = require('./routes/userRoutes');
const brand = require('./routes/brandRoutes');
const category = require('./routes/categoryRoutes');
const product = require('./routes/productRoutes');
const order = require('./routes/orderRoutes');


app.use('/api',user);
app.use('/api',brand);
app.use('/api',category);
app.use('/api',product);
app.use('/api', order);


app.use(errorMiddleware);

const server = app.listen(PORT,()=>{
    console.log(`Server running port: ${PORT} on ${process.env.NODE_ENV} mode`);
})




// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});


