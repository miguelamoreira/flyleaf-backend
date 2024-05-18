const db = require("../models/index.js");
const Leitura = db.leitura;
const Livro = db.livro;

const convertBinaryToBase64 = (binaryData) => {
  return Buffer.from(binaryData).toString('base64');
};

// Retrieve all readings
exports.findAllReadings = async (req, res) => {
  try {
    const allReadings = await Leitura.findAll({
      include: [
        {model: Livro},
      ] 
    });

    if (allReadings.length === 0) {
      return res.status(404).json({ message: "No readings found." });
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
      message: "Readings retrieved successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong. Please try again later" });
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
        message: "Reading created successfully"
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong. Please try again later" });
    }
};