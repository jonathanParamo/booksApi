import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import routes from './routes/routes.js';

dotenv.config();

const corsOptions = {
  origin: process.env.PORT || "http://localhost:8080",
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true,
};

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(port, () => {
  console.log(`Server listening on port. ${port}`);
});
