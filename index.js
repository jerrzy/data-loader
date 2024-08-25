const dotenv = require('dotenv');
const WalkDir = require('./src/data_loader');

dotenv.config();

WalkDir(process.env.dataDir);