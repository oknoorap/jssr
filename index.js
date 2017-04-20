const varType = {
  ARRAY: 'a',
  BOOLEAN: 'b',
  INTEGER: 'i',
  OBJECT: 'O',
  STRING: 's',
  FLOAT: 'd',
  NULL: 'n'
}

/**
* Template definition for replacer
* t: type, l: length, v: value, ks: key length / size, n: key name
*/
const template = {
  [varType.STRING]: 't:l:"v";',
  [varType.INTEGER]: 't:v;',
  [varType.BOOLEAN]: 't:v;',
  [varType.ARRAY]: 't:l:{v}',
  [varType.OBJECT]: 't:ks:"n":l:{v}'
}

const isJSON = str => {
  try {
    const json = JSON.parse(str)
    return json
  } catch (err) {
    return false
  }
}

const objType = (objClass, obj) => {
  return JSON.stringify({
    class: objClass,
    obj
  })
}

const stringify = (value, options) => {
  let type = (typeof value).charAt(0)
  let length = value.length
  let objectName = ''

  if (type === varType.STRING) {
    const json = isJSON(value)
    if (json && json.class) {
      objectName = json.class
      type = varType.OBJECT
      value = json.obj
    }
  }

  const firstStr = (value).toString().charAt(0)
  if (!isNaN(value) && firstStr !== 't' && firstStr !== 'f') {
    type = varType.INTEGER
  }

  if (type === varType.BOOLEAN) {
    value = Number(value)
  }

  let keySize
  if (value instanceof Object && !Array.isArray(value)) {
    const objectKeys = Object.keys(value)
    const objectValues = []

    objectKeys.forEach(key => {
      objectValues.push([stringify(key, options), stringify(value[key], options)].join(''))
    })

    value = objectValues.join('')
    type = (objectName === '') ? varType.ARRAY : varType.OBJECT
    length = objectKeys.length

    if (type === varType.OBJECT) {
      keySize = objectName.length
    }
  }

  if (Array.isArray(value)) {
    const arrValues = []
    value.forEach((item, index) => {
      arrValues.push(stringify(index, options) + stringify(item, options))
    })
    value = arrValues.join('')
    type = varType.ARRAY
  }

  let retval = ''
  for (const key in template) {
    if (type === key) {
      retval = template[key]
        .replace(/t/g, type)
        .replace(/l/g, length)
        .replace(/ks/g, keySize)
        .replace(/n/g, objectName)
        .replace(/v/g, value.toString())
    }
  }

  return retval
}

const utf8Overhead = str => {
  let s = str.length
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7F && code <= 0x7FF) {
      s++
    } else if (code > 0x7FF && code <= 0xFFFF) {
      s += 2
    }
    // Trail surrogate
    if (code >= 0xDC00 && code <= 0xDFFF) {
      i--
    }
  }
  return s - 1
}

const readUntil = (data, offset, stopChr) => {
  const buffer = []
  let i = 2
  let chr = data.slice(offset, offset + 1)

  while (chr !== stopChr) {
    if ((i + offset) > data.length) {
      throw new Error('Invalid')
    }

    buffer.push(chr)
    chr = data.slice(offset + (i - 1), offset + i)
    i++
  }

  return [buffer.length, buffer.join('')]
}

const readChars = (data, offset, length) => {
  const buffer = []
  let chr

  for (let i = 0; i < length; i++) {
    chr = data.slice(offset + (i - 1), offset + i)
    buffer.push(chr)
    length -= utf8Overhead(chr)
  }

  return [buffer.length, buffer.join('')]
}

const parser = (data, offset = 0) => {
  const type = (data.slice(offset, offset + 1)).toLowerCase()
  let dataOffset = offset + 2
  let charsKey
  let length
  let dataValue
  let output
  let charCount
  let strSize
  let shouldContinue
  let value
  let chars = 0
  let convertValue = x => x

  switch (type) {
    case varType.INTEGER:
      convertValue = x => parseInt(x, 10)
      dataValue = readUntil(data, dataOffset, ';')
      chars = dataValue[0]
      output = dataValue[1]
      dataOffset += chars + 1
      break

    case varType.BOOLEAN:
      convertValue = x => parseInt(x, 10) !== 0
      dataValue = readUntil(data, dataOffset, ';')
      chars = dataValue[0]
      output = dataValue[1]
      dataOffset += chars + 1
      break

    case varType.FLOAT:
      convertValue = x => parseFloat(x)
      dataValue = readUntil(data, dataOffset, ';')
      chars = dataValue[0]
      output = dataValue[1]
      dataOffset += chars + 1
      break

    case varType.NULL:
      output = null
      break

    case varType.STRING:
      charCount = readUntil(data, dataOffset, ':')
      chars = charCount[0]
      strSize = charCount[1]
      dataOffset += chars + 2
      dataValue = readChars(data, dataOffset + 1, parseInt(strSize, 10))
      chars = dataValue[0]
      output = dataValue[1]
      dataOffset += chars + 2
      if (chars !== parseInt(strSize, 10) && chars !== output.length) {
        throw new Error('String length mismatch')
      }
      break

    case varType.OBJECT.toLowerCase():
    case varType.ARRAY:
      output = {}
      charsKey = readUntil(data, dataOffset, ':')
      length = parseInt(charsKey[1], 10)
      chars = charsKey[0]
      if (type === varType.OBJECT.toLowerCase()) {
        dataOffset += chars + 2
        const objName = readChars(data, dataOffset + 1, parseInt(length, 10))
        const objLength = objName[0]
        dataOffset += objLength + 2
        charsKey = readUntil(data, dataOffset, ':')
        length = parseInt(charsKey[1], 10)
        chars = charsKey[0]
      }
      shouldContinue = true
      dataOffset += chars + 2

      for (let i = 0; i < length; i++) {
        const keyProps = parser(data, dataOffset)
        const keyChars = keyProps[1]
        const key = keyProps[2]

        dataOffset += keyChars
        const valProps = parser(data, dataOffset)
        const valChars = valProps[1]
        value = valProps[2]
        dataOffset += valChars
        if (key !== i) {
          shouldContinue = false
        }
        const json = isJSON(value)
        if (json) {
          value = json
        }
        output[key] = value
      }

      if (shouldContinue) {
        const array = new Array(length)
        for (let i = 0; i < length; i++) {
          array[i] = output[i]
        }
        output = array
      }
      dataOffset += 1
      break
    default:
      throw new Error(`Unknown / Unhandled data type(s): ${type}`)
  }
  return [type, dataOffset - offset, convertValue(output)]
}

const parse = str => {
  const parsed = offset => parser(str, 0)[offset]
  return parsed(2)
}

module.exports = {
  objType,
  stringify,
  parse
}
