import { exec } from 'child_process';

export function deploy({ name, path, ref }, index) {
  return exec(`cd ${path} && git pull && yarn install && pm2 restart ${name}`, (execErr, out, err) => {
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
  });
}
