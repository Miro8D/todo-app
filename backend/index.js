const express = require('express');
const cors = require('cors');
const todosRouter = require('./routes/todos');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/todos', todosRouter);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
