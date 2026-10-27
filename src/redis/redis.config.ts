import { ConfigService } from '@nestjs/config';

export function getRedisConfig(config: ConfigService) {
  return {
    host: config.get<string>('REDIS_HOST', 'localhost'),
    port: config.get<number>('REDIS_PORT', 6379),
    password: config.get<string>('REDIS_PASSWORD') || undefined,
    db: config.get<number>('REDIS_DB', 0),
    keyPrefix: config.get<string>('REDIS_KEY_PREFIX', 'ecom:'),
    maxRetriesPerRequest: 3,
    lazyConnect: false,
    retryStrategy: (times: number) => Math.min(times * 100, 3000),
  };
}