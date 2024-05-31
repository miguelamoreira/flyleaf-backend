const { Op } = require("sequelize");
const db = require("../models/index.js");
const Notificacao=db.notificacao;
const tipoNotificacao =db.tipoNotificacao;
const configNotifUtilizador = db.configNotifUtilizador;
const Utilizador = db.utilizador;

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

exports.findAllNotifSettingsByUserId = async (req, res) => {
  try {
    let user = await Utilizador.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({
        msg: 'User not found'
      });
    }

    const config = await configNotifUtilizador.findOne({ where: { idUtilizador: user.idUtilizador } });

    if (!config) {
      return res.status(404).json({ msg: "Notification settings not found." });
    }

    return res.status(200).json({ msg: "Configuration retrieved successfully", data: config});
  } catch(error) {

  }
};

exports.updateNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { typeNotifId, state } = req.body;

    if (typeof state !== 'boolean') {
      return res.status(400).json({ msg: "state must be a boolean value." });
    }

    const idTipoNotificacao = typeNotifId;
    const idUtilizador = userId;

    const config = await configNotifUtilizador.findOne({
      where: { idTipoNotificacao, idUtilizador }
    });

    if (!config) {
      return res.status(404).json({ msg: "Configuration not found." });
    }

    config.estadoNotificacao = state;
    await config.save();

    return res.status(200).json({ msg: "Notification status updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something went wrong. Please try again later." });
  }
};