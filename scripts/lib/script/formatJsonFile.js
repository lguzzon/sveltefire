'use strict'

const gPath = require('path')
const gCommon = require(gPath.join(__dirname, '../common.js'))

const gJsonPath = gPath.resolve(process.argv[2])
const gObject = gCommon.getObjectFromJsonFile(gJsonPath)

try {
  gCommon.setObjectToJsonFile(gObject, gJsonPath)
} catch (err) {
  process.exit(1)
}
process.exit(0)
