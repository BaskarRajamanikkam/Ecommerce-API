const  mongoose  = require("mongoose");
const slugify  = require("slugify");


const productSchema = new mongoose.Schema({
    name:{
        type: String,
        // required: [true, "Please enter product name"],
        trim: true
    },
    slug: {
        type: String,
        // required: true,
        unique: true,
        lowercase: true,
      },
    description: {
        type: String,
        // required: [true, "Please enter product description"]
    },
    highlights: [
        {
            type: String,
            // required: true
        }
    ],
    specifications: [
        {
            title: {
                type: String,
                // required: true
            },
            description: {
                type: String,
                // required: true
            }
        }
    ],
    price: {
        type: Number,
        // required: [true, "Please enter product price"]
    },
    cuttedPrice: {
        type: Number,
        // required: [true, "Please enter cutted price"]
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    brand:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Brand',
        // required: true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        // required: true
    },
    stock:{
        type:Number,
        // required: [true, "Please enter product stock"],
        maxlength: [4, "Stock cannot exceed limit"],
        default: 1
    },
    warranty:{
        type:Number,
        default:1,
    },
    ratings:{
        type:Number,
        default:0,
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true
            },
            name:{
                type:String,
                required:true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt:{
        type:Date,
        default: Date.now
    } 
});

// Middleware to create slug before saving
productSchema.pre("save", function(next){
    if(this.isModified('name') || this.slug == null){
        this.slug = slugify(this.name,{lowercase:true});
    }
    next();
})
// Middleware to handle unique slugs
productSchema.pre("save",async function(next){
    if(this.isModified('slug')){
        const existingProduct = await mongoose.models.Product.findOne({slug: this.slug});
        if(existingProduct){
            this.slug = `${this.slug}-${Date.now()}`;
        }
    }
    next();
})

module.exports = mongoose.model('Product', productSchema);