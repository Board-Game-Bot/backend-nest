import dayjs from 'dayjs';
import { padStart } from 'lodash';

export const MakeIdGenerator = (business?: string) => {
  let lastMS = dayjs().format('YYYYMMDDHHmmssSSS');
  let cnt = 0;
  return () => {
    const join = [];
    if (business) join.push(business);
    const ms = dayjs().format('YYYYMMDDHHmmssSSS');
    if (lastMS !== ms) {
      lastMS = ms;
      cnt = 0;
    }
    return [...join, ms, padStart('' + cnt++, 4, '0')].join('-');
  };
};