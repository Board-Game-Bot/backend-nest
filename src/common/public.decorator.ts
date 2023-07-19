import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'is_public';

/**
 * 代表公共接口
 * @constructor
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
