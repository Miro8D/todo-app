const express = require('express');
const cors = require('cors');
const todosRouter = require('./routes/todos');
const accountsRouter = require('./routes/accounts');

const uploadsDir = process.env.UPLOADDIR || "/uploads";

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/todos', todosRouter);
app.use('/api/accounts', accountsRouter);
app.use(uploadsDir, express.static('uploads'));

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
