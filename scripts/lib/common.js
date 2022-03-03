'use strict'

function internetAvailable (aSettings = {}) {
  const lcDns = require('dns-socket')
  return new Promise(function (resolve, reject) {
    const socket = lcDns({
      timeout: aSettings.timeout || 5000,
      retries: aSettings.retries || 5
    })
    socket.query(
      {
        questions: [
          {
            type: 'A',
            name: aSettings.domainName || 'google.com'
          }
        ]
      },
      aSettings.port || 53,
      aSettings.host || '8.8.8.8'
    )
    socket.on('response', () => {
      socket.destroy(() => {
        resolve()
      })
    })
    socket.on('timeout', () => {
      socket.destroy(() => {
        reject(new Error('Timeout happened'))
      })
    })
  })
}

function toJson (aObject) {
  return JSON.stringify(sortObj(aObject), null, 2)
}

function getObjectFromJsonFile (aPath) {
  try {
    const lFs = require('fs')
    if (lFs.existsSync(aPath)) {
      return sortObj(JSON.parse(lFs.readFileSync(aPath, 'utf8')))
    } else {
      return {}
    }
  } catch (err) {
    return {}
  }
}

function setObjectToJsonFile (aObject, aPath) {
  try {
    const lFs = require('fs')
    const lJsonString = toJson(aObject)
    lFs.writeFileSync(aPath, lJsonString, 'utf8')
    return lJsonString
  } catch (err) {
    return ''
  }
}

function binaryHelper (aArray, aItem, aLowerBound, aUpperBound) {
  if (aUpperBound - aLowerBound === 1) {
    if (aItem < aArray[aLowerBound]) aArray.splice(aLowerBound, 0, aItem)
    else if (aItem > aArray[aUpperBound]) {
      aArray.splice(aUpperBound + 1, 0, aItem)
    } else {
      aArray.splice(aUpperBound, 0, aItem)
    }
  } else if (aUpperBound > aLowerBound) {
    const midPoint = Math.floor((aUpperBound - aLowerBound) / 2) + aLowerBound
    aItem < aArray[midPoint]
      ? binaryHelper(aArray, aItem, aLowerBound, midPoint)
      : binaryHelper(aArray, aItem, midPoint, aUpperBound)
  } else {
    aArray.push(aItem)
  }
}

function binaryInsertion (aArray, aItem) {
  return binaryHelper(aArray, aItem, 0, aArray.length - 1)
}

function sortDate () {
  const lDate = new Date()
  const lDateLocal = new Date(
    lDate.getTime() - lDate.getTimezoneOffset() * 60000
  )
  return lDateLocal
    .toISOString()
    .replaceAll(':', '')
    .replaceAll('-', '')
    .replace('T', '-')
    .substring(0, 15)
}

function sortObj (aObject) {
  if (aObject !== null) {
    if (Array.isArray(aObject)) {
      return aObject.map((aItem) => sortObj(aItem))
    } else if (typeof aObject === 'object') {
      return Object.keys(aObject)
        .sort()
        .reduce(function (aResult, aKey) {
          aResult[aKey] = sortObj(aObject[aKey])
          return aResult
        }, {})
    } else {
      return aObject
    }
  } else {
    return aObject
  }
}

module.exports = {
  binaryInsertion,
  getObjectFromJsonFile,
  internetAvailable,
  setObjectToJsonFile,
  sortDate,
  sortObj,
  toJson
}
