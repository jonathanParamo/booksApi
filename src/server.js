import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import routes from './routes/routes.js';

dotenv.config();

const corsOptions = {
  origin: "*",
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true,
};

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hola Andrés' });
});

app.use(express.json());
app.use(cors(corsOptions));
app.use(routes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
