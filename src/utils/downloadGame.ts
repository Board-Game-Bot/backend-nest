import { writeFileSync } from 'node:fs';
import axios from 'axios';

export const downloadGame = async (npmPackage: string, version: string) => {
  const url = `https://cdn.jsdelivr.net/npm/${npmPackage}@${version}/dist/core/index.cjs.js`;
  const fileName = `${__dirname}/${npmPackage}.js`;
  console.log(`loading ${npmPackage}@${version}...`);
  const fetch = async () => {
    try {
      const { data } = await axios({
        url,
        method: 'get',
        timeout: 10000,
        headers: {
          'User-Agent': Math.random().toString().split('.')[1],
        },
      });
      writeFileSync(fileName, data);
      console.log(`${npmPackage}@${version} loaded!`);
    }
    catch (e) {
      fetch();
    }
    finally {
      require(fileName);
    }
  };
  fetch();
};