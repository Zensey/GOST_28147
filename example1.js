/**
 * Created by zensey on 05.08.16.
 */

var GOST_28147 = require('./index')

const _MeshingKeys_8i32 = [
    0x97c8c203, 0x6d99ee04, 0x9e7136db, 0x4a07c0c3,
    0x31a11d29, 0xeccd7d4e, 0xc0fd6a8f, 0x02be4a45
];

const _SubstitutionBoxes = [
    [  4, 10,  9,  2, 13,  8,  0, 14,  6, 11,  1, 12,  7, 15,  5,  3 ],
    [ 14, 11,  4, 12,  6, 13, 15, 10,  2,  3,  8,  1,  0,  7,  5,  9 ],
    [  5,  8,  1, 13, 10,  3,  4,  2, 14, 15, 12,  7,  6,  0,  9, 11 ],
    [  7, 13, 10,  1,  0,  8,  9, 15, 14,  4,  6, 12, 11,  2,  5,  3 ],
    [  6, 12,  7,  1,  5, 15, 13,  8,  4, 10,  9, 14,  0,  3, 11,  2 ],
    [  4, 11, 10,  0,  7,  2,  1, 13,  3,  6,  8,  5,  9, 12, 15, 14 ],
    [ 13, 11,  4,  1,  3, 15,  5,  9,  0, 10, 14,  7,  6,  8,  2, 12 ],
    [  1, 15, 13,  0,  5,  7, 10,  4,  9,  2,  3, 14,  6, 11,  8, 12 ]
]

var gamma = new Buffer([
    0x40, 0xE0, 0x3C, 0x7E,
    0xB3, 0x29, 0x86, 0x6C,
])

var msg = new Buffer([
    0x01, 0x02, 0x03, 0x04,
    0x01, 0x02, 0x03, 0x04,
])

var eng = new GOST_28147(_MeshingKeys_8i32, _SubstitutionBoxes);
eng.setGamma(gamma.readUInt32LE(0), gamma.readUInt32LE(4))

eng.execute_gammingMode(8/4, msg, true);
console.log('cypher:', msg)

eng.setGamma(gamma.readUInt32LE(0), gamma.readUInt32LE(4))
eng.execute_gammingMode(8/4, msg, true);
console.log('original:', msg)