// Exercise 2 - HTTP API for car parts
// task: https://github.com/timotr/harjutused/blob/main/hajusrakendused/spareparts.md
//
// some examples:
// http://localhost:3000/spare-parts
// http://localhost:3000/spare-parts?search=polt&page=10
// http://localhost:3000/spare-parts?search=01290017969
// http://localhost:3000/spare-parts?search=07119900190
import { parse } from 'csv-parse';
import express from 'express';
import fs from 'fs';

const {createReadStream} = fs;
const pgSize = 200;
const port = 3000;
const app = express();
let data = [];

createReadStream("./LE.txt")
  .pipe(parse({ delimiter: "\t" }))
  .on("data", (row) => {
    data.push({ "id": row[0], "name": row[1], "stock": row.slice(2, 7), "pricewovat": row[8], "type": row[9], "price": row[10] });
  })
  .on("error", (error) => {
    console.error(error.message);
    res.status(500).json({ error: 'file read error.' });
  });

app.get('/spare-parts', (req, res) => {
  const pg = parseInt(req.query.page || 1);
  let searchdata = data;
  if (req.query.search) {
    searchdata = data.filter((item) => {
      return item.name.toLowerCase().includes(req.query.search.toLowerCase()) || item.id.toLowerCase().startsWith(req.query.search.toLowerCase());
    });
  }

  const totalPg = Math.ceil(searchdata.length / pgSize);
  res.setHeader('_Total_Items', searchdata.length);
  res.setHeader('_Current_Page', pg);
  res.setHeader('_Total_Pages', totalPg);

  if (!isNaN(pg)) {
    const startI = (pg - 1) * pgSize;
    const lastI = startI + pgSize;
    const pagedData = searchdata.slice(startI, lastI);
    res.json(pagedData);
  } else {
    res.status(400).json({error:' unknown page'});
  }
});

app.listen(port, () => {
  console.log(`Server Running http://localhost:${port}/spare-parts?page=1 \n port: ${port}`);
});

// node -v >> cd .. >> npm init -y >> npm install express csv-parse
// node server.js