const { Op } = require("sequelize");
const db = require("../models/index.js");
const Notification=db.notificacao;
const TypeNotification =db.tipoNotificacao;

// Controller para buscar todas as notificações do utilizador autenticado
exports.findAllNotifications = async (req, res) => {
  try {
    const notifications = await db.notificacao.findAll();

    if (notifications.length === 0) {
      return res.status(404).json({ message: "No notifications found." });
    }

    return res.status(200).json({
      data: notifications,
      msg: "Notifications retrieved successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong. Please try again later" });
  }
};

// Controller para atualizar as configurações de notificação do utilizador
exports.updateNotificationSettings = async (req, res) => {
  const { typeNotificationId } = req.query;

  try {
    const typeNotification = await TypeNotification.findByPk(typeNotificationId);

    if (!typeNotification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    // Atualiza as configurações de notificação do utilizador
    // Aqui você implementaria a lógica para atualizar as configurações de notificação do utilizador

    return res.status(200).json({ message: "Notifications updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong. Please try again later" });
  }
};
