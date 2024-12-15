/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

import ms from 'ms';

process.env.MONGO_PREFIX = 'e2e';

jest.setTimeout(ms('24h'));
