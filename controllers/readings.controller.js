const db = require("../models/index.js");
const Leitura = db.leitura;
const CriticaLivro = db.criticaLivro;
const Livro = db.livro;
const Autor = db.autor;

const { Op, ValidationError, Sequelize } = require('sequelize');

const convertBinaryToBase64 = (binaryData) => {
  return Buffer.from(binaryData).toString('base64');
};

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
              attributes: [] // Exclude join table attributes if not needed
            }
          },
        },
        {
          model: CriticaLivro,
          where: {
            idLivro: { [Op.col]: 'leitura.idLivro' }, // Match idLivro with Leitura
            idUtilizador: { [Op.col]: 'leitura.idUtilizador' }, // Match idUtilizador with Leitura
            dataLeitura: { [Op.col]: 'leitura.dataLeitura' }, // Match dataLeitura with Leitura
          },
          on: {
            dataLeitura: Sequelize.col('leitura.dataLeitura')
          },
          required: false // Allow null values for CriticaLivro to avoid inner join
        }
      ]
    });

    if (allReadings.length === 0) {
      return res.status(404).json({ msg: "No readings found." });
    }

    const readings = allReadings.map(reading => {
      const livro = reading.Livro;
      if (livro && livro.capaLivro) {
        livro.capaLivro = convertBinaryToBase64(livro.capaLivro);
      }
      return reading;
    });

    return res.status(200).json({
      data: readings,
      msg: "Readings retrieved successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something went wrong. Please try again later" });
  }
};

// Create a new reading (button "read")
exports.createReading = async (req, res) => {
    const { idUtilizador, idLivro } = req.body;
    const readingDate = new Date().toISOString().split('T')[0]; 
  
    try {
      const reading = await Leitura.create({
        idUtilizador: idUtilizador,
        idLivro: idLivro,
        dataLeitura: readingDate,
        Livro: { idLivro: idLivro }
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
    const { idLivro, idUtilizador, dataLeitura } = req.body;
    const formattedDataLeitura = new Date(dataLeitura).toISOString();

    const reading = await Leitura.findOne({
      where: { 
        idLivro: idLivro, 
        idUtilizador: idUtilizador, 
        dataLeitura: formattedDataLeitura
      }
    });

    if (!reading) {
      return res.status(404).json({ msg: "Reading not found." });
    }

    const review = await CriticaLivro.findOne({
      where: { idLivro: idLivro, idUtilizador: idUtilizador, dataLeitura: formattedDataLeitura }
    });

    if (review) {
      await review.destroy();
    }

    await Leitura.destroy({
      where: { 
        idLivro: idLivro, 
        idUtilizador: idUtilizador, 
        dataLeitura: formattedDataLeitura
      }
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting reading: ", error);
    return res.status(500).json({ msg: "Something went wrong. Please try again later." });
  }
};
