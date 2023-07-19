import argon2 from 'argon2';
import crypto from 'crypto';

/**
 * 哈希化
 * @param passwd
 */
export function encrypt(passwd: string) {
  const hash = crypto.createHash('sha256').update(passwd).digest('hex');
  return argon2.hash(
    hash.substring(0, hash.length / 2) +
      passwd +
      hash.substring(hash.length / 2, hash.length),
  );
}

/**
 * 验证
 * @param hashPasswd
 * @param passwd
 */
export function verify(hashPasswd: string, passwd: string) {
  const hash = crypto.createHash('sha256').update(passwd).digest('hex');
  return argon2.verify(
    hashPasswd,
    hash.substring(0, hash.length / 2) +
      passwd +
      hash.substring(hash.length / 2, hash.length),
  );
}
