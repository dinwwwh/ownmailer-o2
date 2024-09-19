#!/usr/bin/env node

/** dinwwwh */

import { start } from './commands/start'

const program = start
  .name(__APP_NAME__)
  .alias('start')
  .version(__APP_VERSION__)

program.parse()
