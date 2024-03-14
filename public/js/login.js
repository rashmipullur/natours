/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (error) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

export const signup = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account created successfully');
      window.setTimeout(location.assign.bind(location, '/'), 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};