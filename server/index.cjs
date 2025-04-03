const express = require('express')
const path = require('path')
const cors = require('cors')
const app = express()
const port = 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());

app.use(express.static(path.join(__dirname, './build')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, './build/index.html'));
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})