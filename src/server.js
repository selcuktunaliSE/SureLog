const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use the port provided by the environment or 3000 as a default

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});