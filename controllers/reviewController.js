const Review = require('../models/reviewModel');
// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   // // 160. Adding a nested GET endpoint
//   // let filter = {};
//   // if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews: reviews,
//     },
//   });
// });
exports.getAllReviews = factory.getAll(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//   // 158. Implementing simple nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id; // req.user from protect middleware

//   const newReview = await Review.create(req.body);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });

exports.setTourUserIds = (req, res, next) => {
  // 158. Implementing simple nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // req.user from protect middleware
  next();
};

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
