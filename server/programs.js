'use strict'

const PROGRAMS = require('../src/data/programs.json')
const PROGRAMS_MAP = {}

for (const p of PROGRAMS) PROGRAMS_MAP[p.id] = p

module.exports = { PROGRAMS, PROGRAMS_MAP }
