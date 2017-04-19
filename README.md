# Javascript Serialization (jssr)
JSSR is PHP-style serialization store in Javascript, a life-saver js module when working on project that depends on PHP and Javascript at the same time.

# Install
Using NPM:  
`npm install jssr --save`

Using Yarn:  
`yarn add jssr`

# Usage

## `stringify`
```javascript
// Output: 's:11:"hello world";'
jssr.stringify('hello world')

// Output: 'i:10;'
jssr.stringify(10)

// Output: 'b:1;'
jssr.stringify(true)

// Output: 'a:4:{i:0;s:8:"strArray";i:1;i:10;i:2;b:0;i:3;a:1:{s:3:"key";s:5:"value";}}'
jssr.stringify(['strArray', 10, false, {key: 'value'}])

// You also can create new object type like php style with jssr.objType
// Output: 'a:3:{s:9:"greetings";s:5:"hello";s:12:"customObject";O:8:"stdClass":2:{s:3:"str";s:8:"universe";s:4:"good";b:1;}s:12:"normalObject";a:1:{s:4:"good";b:1;}}'

jssr.stringify({
  greetings: 'hello',
  customObject: jssr.objType('stdClass', {
    str: 'universe',
    good: true
  }),
  normalObject: {
    good: true
  }
})
```

## `parse`
```javascript
// Output: hello world
jssr.parse('s:11:"hello world";')

// Output: 10
jssr.parse('i:10;')

// Output: true
jssr.parse('b:1;')

// Output: ['strArray', 10, false, {key: 'value'}]
jssr.parse('a:4:{i:0;s:8:"strArray";i:1;i:10;i:2;b:0;i:3;a:1:{s:3:"key";s:5:"value";}}')

/*
Output: {
  greetings: 'hello',
  customObject: {
    str: 'universe',
    good: true
  },
  normalObject: {
    good: true
  }
}
*/
jssr.parse('a:3:{s:9:"greetings";s:5:"hello";s:12:"customObject";O:8:"stdClass":2:{s:3:"str";s:8:"universe";s:4:"good";b:1;}s:12:"normalObject";a:1:{s:4:"good";b:1;}}')
```

# License
MIT © [oknoorap](https://github.com/oknoorap)
