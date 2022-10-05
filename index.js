import { config } from 'dotenv';
import express from 'express';
import fs from 'fs/promises';
import http from 'http';
import { load } from 'js-yaml';
import { deploy } from './utils/deploy.js';

config();

const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

const main = async () => {
  const app = express();
  const configsFile = await fs.readFile('config.yaml', 'utf-8');
  const configs = load(configsFile);

  app.use(express.json());
  app.post('/deploy/:token', async (req, res) => {
    if (SECRET !== req.params.token) {
      res.status(401);
      res.end('unauthorized');
    }
    const result = {};
    configs.forEach((app, index) => {
      if (app.ref !== req.body.ref) {
        result[app.name] = `${app.name} refs did not match, app ref:${app.ref} - remote ref:${req.body.ref}`;
        console.log(`---SKIPPING DEPLOYMENT FOR ${app.name}, REFS DID NOT MATCH---`);
        console.log(`APP REF: ${app.ref}`);
        console.log(`REMOTE REF: ${req.body.ref}`);

        return;
      }
      deploy(app, index);
    });
    result.done = true;
    res.json(result);
  });

  http.createServer(app).listen(PORT, () => {
    console.log('listening on PORT: ' + PORT);
  });
};

main().catch((e) => console.error('MAIN', e));
