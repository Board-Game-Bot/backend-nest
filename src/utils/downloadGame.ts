import { existsSync, writeFileSync } from 'node:fs';
import axios from 'axios';

export const downloadGame = async (npmPackage: string, version: string) => {
  const url = `https://cdn.jsdelivr.net/npm/${npmPackage}@${version}/dist/core/index.cjs.js`;
  const fileName = `${__dirname}/${npmPackage}.js`;
  const fetch = async () => {
    try {
      console.log(`loading ${npmPackage}@${version}...`);
      const { data } = await axios({
        url,
        method: 'get',
        timeout: 10000,
        responseType: 'blob',
      });
      writeFileSync(fileName, data);
    }
    catch (e) {
      await fetch();
    }
  };
  if (!existsSync(fileName)) await fetch();
  require(fileName);
  console.log(`${npmPackage}@${version} loaded!`);
};