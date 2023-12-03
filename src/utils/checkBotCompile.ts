import { API } from './request';

export const checkBotCompile = async (lang: string, code: string) => {
  const containerId = (await API.post('/create', {
    lang,
    code,
  })).data.containerId;
  const message = (await API.post('/compile', {
    containerId,
  })).data.message;
  return [containerId, message];
};
