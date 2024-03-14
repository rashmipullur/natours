/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51OpY4USInKL3UiAP6qlNlCBq84yddweCN3aAegdBBtBLC94zBE5ixJPdUn7hM9UbgaMEipVlJp4rJtsNd4tcQYZK00gAGz2VDs',
);

export const bookTour = async (tourId) => {
  try {
    // get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (e) {
    showAlert('error', e);
  }
};
