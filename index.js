const dotenv = require('dotenv');
const {WalkDir, LoadCSVs} = require('./src/dir_loader');

dotenv.config();

const assets = [];

WalkDir(process.env.dataDir, '', '', assets);

// console.log(assets);

LoadCSVs(assets);