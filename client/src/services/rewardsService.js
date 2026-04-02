import axios from 'axios';

export function getUserRewards(userId) {
  return axios.get(`/api/checkins/user/${userId}`);
}
