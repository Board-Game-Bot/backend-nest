import dayjs from 'dayjs';
import { padStart } from 'lodash';

let lastMS = '';
let cnt = 0;

export const generateRequestId = () => {
  const ms = dayjs().format('YYYYMMDDHHmmssSSS');
  if (lastMS !== ms) {
    lastMS = ms;
    cnt = 0;
  }
  const key = lastMS + padStart('' + cnt++, 4, '0');
  return key;
};
