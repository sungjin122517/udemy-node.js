/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'data'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMe'
        : 'http://127.0.0.1:3000/api/v1/users/updateMyPassword';
    const res = await axios({
      method: 'PATCH',
      url: url,
      data: data,
    });

    if (res.data.status == 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully.`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
