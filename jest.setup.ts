/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

import ms from 'ms';

process.env.MONGO_PREFIX = 'e2e';
process.env.REDIS_PREFIX = 'e2e';
process.env.ELASTIC_PREFIX = 'e2e';
process.env.POSTGRES_PREFIX = 'e2e';

jest.setTimeout(ms('24h'));
