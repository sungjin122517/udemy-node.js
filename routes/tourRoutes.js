const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

// 3) ROUTES
// mounting new router
const router = express.Router(); // middleware

// param middleware
// router.param('id', tourController.checkID);

// 158. Implementing simple nested routes
// POST /tour/134adfa/reviews
// GET /tour/134adfa/reviews
// GET /tour/134adfa/reviews/23543adfss
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview,
//   );

// 159. Nested routes with Express
router.use('/:tourId/reviews', reviewRouter); // whenever you find a URL like this, then just use the review router

router
  .route('/top-5-cheap')
  .get(tourController.aliasing, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

// 171. Geospatial Queries: Finding Tours Within Radius
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// e.g. /tours-within?distance=233&center=-40,45&unit=mi
// better e.g. /tours-within/233/center/-40,45/unit/mi

// 172. Geospatial aggregation: calculating distances
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours) // middleware function to protect getAllTours route
  // 165. Adding missing authentication and authorization
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
