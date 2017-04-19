import test from 'ava'
import deepEqual from 'deep-equal'
import jssr from './index'

const str = 'hello world'
const strSerialized = 's:11:"hello world";'

const int = 10
const intSerialized = 'i:10;'

const bool = true
const boolSerialized = 'b:1;'

const array = ['strArray', 10, false, {key: 'value'}]
const arrSerialized = 'a:4:{i:0;s:8:"strArray";i:1;i:10;i:2;b:0;i:3;a:1:{s:3:"key";s:5:"value";}}'

const obj = {
  greetings: 'hello',
  customObject: jssr.objType('stdClass', {
    str: 'universe',
    good: true
  }),
  normalObject: {
    good: true
  }
}
const objSerialized = 'a:3:{s:9:"greetings";s:5:"hello";s:12:"customObject";O:8:"stdClass":2:{s:3:"str";s:8:"universe";s:4:"good";b:1;}s:12:"normalObject";a:1:{s:4:"good";b:1;}}'

test('string should be serialized', t => {
  t.is(jssr.stringify(str), strSerialized)
})

test('serialized string should be string', t => {
  t.is(str, jssr.parse(strSerialized))
})

test('number should be serialized', t => {
  t.is(jssr.stringify(int), 'i:10;')
})

test('serialized number should be number', t => {
  t.is(jssr.parse(intSerialized), 10)
})

test('boolean should be serialized', t => {
  t.is(jssr.stringify(bool), boolSerialized)
})

test('serialized boolean should be boolean', t => {
  t.is(jssr.parse(boolSerialized), true)
})

test('array should be serialized', t => {
  t.is(jssr.stringify(array), arrSerialized)
})

test('serialized array should be array', t => {
  t.is(jssr.parse(arrSerialized), array)
})

test('object should be serialized', t => {
  const object = jssr.stringify(obj)
  t.is(object, objSerialized)
})

test('serialized object should be object', t => {
  t.true(deepEqual(jssr.parse(objSerialized, obj)))
})
