const jssr = require('./index')

const str = 's:11:"hello world";'
console.log(jssr.parse(str), typeof jssr.parse(str))

const int = 'i:10;'
console.log(jssr.parse(int), typeof jssr.parse(int))

const bool = 'b:0;'
console.log(jssr.parse(bool), typeof jssr.parse(bool))

const arr = 'a:4:{i:0;s:8:"strArray";i:1;i:10;i:2;b:0;i:3;a:1:{s:3:"key";s:5:"value";}}'
console.log(jssr.parse(arr), typeof jssr.parse(arr))
