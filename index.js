require('dotenv').config();         // read environment variables from .env file
const express = require('express'); 
const cors = require('cors');       // middleware to enable CORS (Cross-Origin Resource Sharing)

const app = express();
const port = process.env.PORT;	 	

app.use(cors()); //enable ALL CORS requests (client requests from other domain)
app.use(express.json()); //enable parsing JSON body data

// root route -- /api/
app.get('/', function (req, res) {
    res.status(200).json({ message: 'home -- Flyleaf api' });
});

app.use('/users', require("./routes/users.routes.js"));
app.use('/books', require("./routes/books.routes.js"));
app.use('/categories', require("./routes/genres.routes.js"))
app.use('/reading-lists', require("./routes/lists.routes.js"))
app.use('/requests', require("./routes/bookRequests.routes.js"))
app.use('/readings', require("./routes/readings.routes.js"))
app.use('/notifications', require("./routes/notifications.routes.js"))

// handle invalid routes
app.all('*', function (req, res) {
	res.status(400).json({ success: false, msg: `The API does not recognize the request on ${req.url}` });
})
app.listen(port, () => console.log(`App listening at http://${host}:${port}/`));