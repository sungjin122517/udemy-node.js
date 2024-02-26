// const fs = require('fs');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// 2) ROUTE HANDLERS
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

exports.checkID = (req, res, next, val) => {
  // console.log(`Tour id is: ${val}`);
  // if (req.params.id * 1 > tours.length) {
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID',
  //   });
  // }
  // next();
};

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

// 5) ALIASING
exports.aliasing = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// GET Request
// exports.getAllTours = catchAsync(async (req, res) => {
//   // console.log(req.query);

//   // const tours = await Tour.find({
//   //   duration: 5,
//   //   difficulty: easy,
//   // });

//   // const tours = await Tour.find(req.query);

//   // BUILD QUERY
//   // 1A) filtering
//   // const queryObject = { ...req.query };
//   // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   // excludedFields.forEach((el) => delete queryObject[el]);

//   // 1B) advanced filtering
//   // let queryString = JSON.stringify(queryObject);
//   // queryString = queryString.replace(
//   //   /\b(gte|gt|lte|lt)\b/g,
//   //   (match) => `$${match}`,
//   // );
//   // console.log(JSON.parse(queryString));

//   // let query = Tour.find(JSON.parse(queryString));

//   // 2) SORT
//   // if (req.query.sort) {
//   //   // single
//   //   // query = query.sort(req.query.sort); // same as query.sort('price') for ?sort=price

//   //   // double
//   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   query = query.sort(sortBy);
//   // } else {
//   //   // query = query.sort('-createdAt');
//   // }

//   // // 3) FIELD LIMITING
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   query = query.select(fields);
//   // } else {
//   //   query = query.select('-__v');
//   // }

//   // 4) PAGINATION
//   // e.g. page=2&limit=10
//   // const page = req.query.page * 1 || 1;
//   // const limit = req.query.limit * 1 || 100;
//   // const skip = (page - 1) * limit;

//   // query = query.skip(skip).limit(limit);

//   // if (req.query.page) {
//   //   const numTours = await Tour.countDocuments();
//   //   if (skip >= numTours) throw new Error('This page does not exist');
//   // }

//   // EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query; // query executed

//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tour: tours,
//     },
//   });
// });
exports.getAllTours = factory.getAll(Tour);

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // Tour.findOne({ _id: req.params.id })

//   // 117. Adding 404 Not Found Errors
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// });
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// POST Request: create document using mongoose
exports.createTour = factory.createOne(Tour);

// PATCH: Update
exports.updateTour = factory.updateOne(Tour);

// DELETE
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: {
//       tour: null,
//     },
//   });
// });

// 161. Building handler factory functions: delete
exports.deleteTour = factory.deleteOne(Tour);

// 102. Aggregation Pipeline (check mongodb documentation)
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },
    //   },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats,
    },
  });
});

// 103. Aggregation Pipeline: Unwinding and Projecting
// unwind: deconstruct an array field into the info documents and then output one document for each element of the array
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, // if 0, id no longer shows up. if 1, it shows up
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12, // only display 12 elements
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan: plan,
    },
  });
});

// 171. Geospatial Queries: Finding Tours Within Radius
// /tours-within/:distance/center/:latlng/unit/:unit
// better e.g. /tours-within/233/center/-40,45/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError('Please provide lat and longitutde in the format lat, lng'),
      400,
    );
  }

  // locate places within this radius
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  // console.log(distance, lat, lng, unit);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// 172. Geospatial aggregation: calculating distances
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.00062 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError('Please provide lat and longitutde in the format lat, lng'),
      400,
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    // only show distance and name as result
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
