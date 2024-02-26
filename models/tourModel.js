const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

// create basic schema model
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // built-in validator
      unique: true, // NOT a validator
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'], // validator
      minlength: [10, 'A tour name must have more or equal than 10 characters'], // validator
      // validator: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      // validator (only for strings)
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // min and max for numbers and dates
      min: [1, 'Rating must be above 1.0'], // validator
      max: [5, 'Rating must be below 5.0'], // validator
      set: (val) => Math.round(val * 10) / 10, // 4.66666 -> 46.6666 -> 47 -> 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // custom validator
      // function has access to value that was inputted. In this case, price discount
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // 152. Child referencing
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 167. Improving read performance with indexes
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// virtual properties
tourSchema.virtual('durationWeeks').get(function () {
  // using regular function to make use of this keyword
  return this.duration / 7;
});

// 157. Virtual Populate: Tours and Reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// 105. Document middleware: pre runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // console.log(this); // this: document that is being processed
  this.slug = slugify(this.name, { lower: true });
  next();
});

// 151. Modelling tour guides: embedding
// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromises); // embedding: saving object itself instead of id
//   next();
// });

// post runs before .save() and .create()
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// 106. Query middleware
tourSchema.pre(/^find/, function (next) {
  // all the strings that start with find
  // tourSchema.pre('find', function (next) {
  // this keyword points to current query
  // e.g. secret tour for VIP -> do not want it to appear in the result output
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// 153. Populating tour guides
// query middleware
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides', // populate guides
    select: '-__v -passwordChangedAt', // do not show __v and passwordChangedAt
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} ms`);
//   // console.log(docs);
//   next();
// });

// 107. Aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   // add in the beginning of array
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   // this keyword points to current aggregation object
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
