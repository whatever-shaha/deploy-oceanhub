import { exec } from 'child_process';
import fs from 'fs/promises';
import { load } from 'js-yaml';
import { config } from 'dotenv';
import express from 'express';
import http from 'http';

config();

const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

const main = async () => {
  const app = express();
  const configsFile = await fs.readFile('config.yaml', 'utf-8');
  const configs = load(configsFile);

  app.post('/deploy/:token', async (req, res) => {
    res.end('done');
    fs.writeFile('hook.json', JSON.stringify(req.body, null, 2));
  });

  app.get('/deploy/:token', async (req, res) => {
    if (req.params.token !== SECRET) {
      res.status(401);
      return res.end();
    }

    // TODO: send msg through telegram about the deployment result
    configs.forEach((app, index) => {
      const [name, path] = Object.entries(app)[0];
      deploy(name, path, index);
    });
    req.send('done');
  });

  http.createServer(app).listen(PORT, () => {
    console.log('listening on PORT: ' + PORT);
  });
};

main().catch((e) => console.error('MAIN', e));

function deploy(name, path, index) {
  return exec(
    `cd ${path} && git pull && yarn install && yarn build && pm2 restart ${name}`,
    (execErr, out, err) => {
      console.log('');
      console.log(`............deployment start ${index}:${name}............`);
      console.log('path: ' + path);
      if (execErr) {
        console.log(execErr);
      }
      if ((execErr === null) & (err === '')) {
        console.log(`+++++++++++++++++deployment finish success ${index}:${name}+++++++++++++++++`);
      } else {
        console.log(`xxxxxxxxxxxxxxxxxxxx -deployment finish ERROR ${index}:${name}- xxxxxxxxxxxxxxxxxxxx`);
      }
      console.log('');
    }
  );
}
