import { exec } from 'child_process';
import fs from 'fs/promises';
import { load } from 'js-yaml';
import { config } from 'dotenv';
import express from 'express';
import http from 'http';

config();

const projectPath = process.env.PROJECT_PATH;
const appName = process.env.APP_NAME;
const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

const main = async () => {
  const app = express();
  const configsFile = await fs.readFile('config.yaml', 'utf-8');
  const configs = load(configsFile);

  app.get('/deploy/:token', async (res, req) => {
    if (res.params.token !== SECRET) {
      req.status(401);
      return req.end();
    }

    // TODO: send msg through telegram about the deployment result
    configs.forEach((app, index) => {
      const [name, path] = Object.entries(app)[0];
      deploy(name, path, index).on('exit', (code) => {});
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
