import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { testConnection, sequelize } from './models/datasource.js'
import { User } from './models/user.js'

const app = express();
const PORT =  3000;

app.use(cors());
app.use(express.json());

// test
app.get('/api/hello', async (req, res) => {
  const user = await User.create({ username: 'test1', nickname: 'Test User' })
  res.json({ message: `User ${user.username} created` })
})

const init = async () => {
  await testConnection()
  await sequelize.sync({ alter: true })

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
}

init()