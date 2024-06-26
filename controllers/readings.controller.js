const db = require("../models/index.js");
const Leitura = db.leitura;
const CriticaLivro = db.criticaLivro;
const Livro = db.livro;
const Autor = db.autor;
const Utilizador = db.utilizador;

const { Op, ValidationError, Sequelize } = require('sequelize');

// Retrieve all readings
exports.findAllReadings = async (req, res) => {
  try {
    const allReadings = await Leitura.findAll({
      include: [
        {
          model: Livro,
          include: {
            model: Autor,
            as: 'autors', 
            attributes: ['nomeAutor'],
            through: {
              attributes: [] 
            }
          },
        },
        {
          model: CriticaLivro,
          where: {
            idLivro: { [Op.col]: 'leitura.idLivro' }, 
            idUtilizador: { [Op.col]: 'leitura.idUtilizador' }, 
            dataLeitura: { [Op.col]: 'leitura.dataLeitura' }, 
          },
          on: {
            dataLeitura: Sequelize.col('leitura.dataLeitura')
          },
          required: false 
        }
      ]
    });

    if (allReadings.length === 0) {
      return res.status(404).json({ msg: "No readings found." });
    }

    return res.status(200).json({
      data: allReadings,
      msg: "Readings retrieved successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something went wrong. Please try again later" });
  }
};

// Create a new reading (button "read")
exports.createReading = async (req, res) => {
    const { userId, bookId } = req.body;
    const date = new Date().toISOString().split('T')[0]; 

    if (!userId || !bookId) {
      res.status(400).json({ msg: 'The data given is incorrect and/or some parameters are missing.' })
    }

    let user = await Utilizador.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let book = await Livro.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
  
    try {
      const reading = await Leitura.create({
        idUtilizador: userId,
        idLivro: bookId,
        dataLeitura: date,
        Livro: { idLivro: bookId }
      });
  
      return res.status(201).json({
        data: reading,
        msg: "Reading created successfully"
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Something went wrong. Please try again later" });
    }
};

exports.deleteReading = async (req, res) => {
  try {
    const { bookId, userId, date } = req.body;
    const formattedDataLeitura = new Date(date).toISOString();

    const reading = await Leitura.findOne({
      where: { 
        idLivro: bookId, 
        idUtilizador: userId, 
        dataLeitura: formattedDataLeitura
      }
    });

    if (!reading) {
      return res.status(404).json({ msg: "Reading not found." });
    }

    const review = await CriticaLivro.findOne({
      where: { idLivro: bookId, idUtilizador: userId, dataLeitura: formattedDataLeitura }
    });

    if (review) {
      await review.destroy();
    }

    await Leitura.destroy({
      where: { 
        idLivro: bookId, 
        idUtilizador: userId, 
        dataLeitura: formattedDataLeitura
      }
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting reading: ", error);
    return res.status(500).json({ msg: "Something went wrong. Please try again later." });
  }
};
