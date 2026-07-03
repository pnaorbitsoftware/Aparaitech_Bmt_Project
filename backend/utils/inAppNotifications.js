const Notification = require("../models/Notification");
const User = require("../models/User");

async function createNotification(data) {
  if (!data.recipientId) return null;
  return Notification.create(data);
}

async function notifyAdmins(data) {
  const admins = await User.find({
    role: "super_admin",
    isActive: true,
  }).select("_id");
  return Promise.all(
    admins.map((admin) =>
      createNotification({
        ...data,
        recipientType: "admin",
        recipientId: admin._id,
      }),
    ),
  );
}

async function notifyStore(storeId, data) {
  if (!storeId) return [];
  const users = await User.find({
    storeId,
    role: { $in: ["admin", "staff"] },
    isActive: true,
  }).select("_id");
  return Promise.all(
    users.map((user) =>
      createNotification({
        ...data,
        recipientType: "store",
        recipientId: user._id,
      }),
    ),
  );
}

module.exports = { createNotification, notifyAdmins, notifyStore };
