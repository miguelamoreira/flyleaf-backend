const { Op } = require("sequelize");
const db = require("../models/index.js");
const Notification=db.notificacao;
const TypeNotification =db.tipoNotificacao;

// Controller para buscar todas as notificações do utilizador autenticado
exports.findAllNotifications = async (req, res) => {
  try {
    const notifications = await db.notificacao.findAll();

    if (notifications.length === 0) {
      return res.status(404).json({ msg: "No notifications found." });
    }

    return res.status(200).json({
      data: notifications,
      msg: "Notifications retrieved successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something went wrong. Please try again later" });
  }
};
