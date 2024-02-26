const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// 3) ROUTES
// mounting new router
const router = express.Router({ mergeParams: true }); // middleware

// 165. Adding missing authentication and authorization
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;