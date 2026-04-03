const axios = require('axios');
// ClickSend API SMS service integration for sending reservation confirmations and reminders.
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('0')) return '+61' + cleaned.slice(1);
  return '+61' + cleaned;
};

const sendSMS = async (to, message) => {
  try {
    const formattedNumber = formatPhoneNumber(to);

    const response = await axios.post(
      'https://rest.clicksend.com/v3/sms/send',
      {
        messages: [
          {
            to: formattedNumber,
            body: message,
            source: 'reservation-system'
          }
        ]
      },
      {
        auth: {
          username: process.env.CLICKSEND_USERNAME,
          password: process.env.CLICKSEND_API_KEY
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`SMS sent to ${formattedNumber}`, response.data);
  } catch (err) {
    console.error('SMS failed:', err.response?.data || err.message);
  }
};

module.exports = sendSMS;