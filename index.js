const varType = {
  ARRAY: 'a',
  BOOLEAN: 'b',
  INTEGER: 'i',
  OBJECT: 'O',
  STRING: 's'
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

  const firstStr = (value).toString().charAt(0)
  if (!isNaN(value) && firstStr !== 't' && firstStr !== 'f') {
    type = varType.INTEGER
  }

  if (type === varType.BOOLEAN) {
    value = Number(value)
  }

  const objectName = (options && 'obj' in options) ? options.obj : ''
  let keySize
  if (value instanceof Object && !Array.isArray(value)) {
    const objectKeys = Object.keys(value)
    const objectValues = []

    objectKeys.forEach(key => {
      let objValue = stringify(value[key], options)
      const json = isJSON(value[key])

      if (json && json.class) {
        const newOptions = Object.assign(options || {}, {obj: json.class})
        objValue = stringify(json.obj, newOptions)
      }

      objectValues.push([stringify(key, options), objValue].join(''))
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

module.exports.stringify = stringify
module.exports.objType = objType
