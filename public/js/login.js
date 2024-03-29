// 189. Login with API
/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  //   alert(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully.');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    // console.log(err.response.data);
    showAlert('error', err.response.data.message);
  }
};

// 192. Logging out users
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (res.data.status == 'success') location.reload(true); // reload the server
  } catch (err) {
    console.log(`error! ${err.response}`);
    showAlert('error', 'Error logging out! Try again');
  }
};
