const express = require('express');
const router = express.Router();
const sendSMS = require('../utils/smsService');

router.post('/test', async (req, res) => {
  const { phoneNum, message } = req.body;

  if (!phoneNum || !message) {
    return res.status(400).json({ message: 'phoneNum and message are required' });
  }

  try {
    await sendSMS(phoneNum, message);
    res.status(200).json({ message: `SMS sent to ${phoneNum}` });
  } catch (err) {
    res.status(500).json({ message: 'SMS failed', error: err.message });
  }
});

module.exports = router;