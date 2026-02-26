const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM_SMS = process.env.TWILIO_PHONE;
const FROM_WA = "whatsapp:" + process.env.TWILIO_WA_NUMBER;

exports.sendSMS = async (to, message) => {
  return client.messages.create({
    body: message,
    from: FROM_SMS,
    to
  });
};

exports.sendWhatsApp = async (to, message) => {
  return client.messages.create({
    body: message,
    from: FROM_WA,
    to: "whatsapp:" + to
  });
};
