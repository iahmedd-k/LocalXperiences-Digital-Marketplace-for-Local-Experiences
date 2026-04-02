const { successResponse } = require('../utils/apiResponse');
const badges = require('../config/badges');

const LEVELS = [
  { threshold: 0, label: 'Explorer', desc: 'Starting your journey' },
  { threshold: 150, label: 'Local Explorer', desc: 'You know your way around' },
  { threshold: 500, label: 'Insider', desc: 'A true veteran of local spots' },
  { threshold: 1000, label: 'City Legend', desc: 'The ultimate local authority' },
];

const getRewardsConfig = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'Rewards configuration fetched', { badges, LEVELS });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRewardsConfig };
