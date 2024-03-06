const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Stripe checkout - https://stripe.com/docs/payments/checkout
// Stripe JS reference - https://stripe.com/docs/js
// Stripe API reference - https://stripe.com/docs/api

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //  create checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
    mode: 'payment', // accept one-time payments
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${
      tour.price
    }`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
  });

  //create a session response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // this is only temp, coz its unsecure: everyone can make boookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  console.log(req.originalUrl, '----------', req.query);
  res.redirect(req.originalUrl.split('?')[0]);
});
