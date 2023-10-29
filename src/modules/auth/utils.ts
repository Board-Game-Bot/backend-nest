import crypto from 'crypto';
import argon2 from 'argon2';

/**
 *
 * @param passwd
 * @desc 字符串哈希化
 * @tutorial `const hashedPassword = await encrypt(passwd)`
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
 *
 * @param hashPasswd
 * @param passwd
 * @desc 哈希验证
 * @tutorial `if (await verify(hashPassword, passwd))`
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
