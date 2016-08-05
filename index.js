/*
 * This is a simple implementation of cipher Magma defined in GOST 28147-89
 * created by Anton Litvinov
 * 05.08.2016
 *
 * references:
 * https://habrahabr.ru/post/256843/
 * https://github.com/sftp/gost28147
 */


/*
 * RFC 4357 section 11.2
 */

const Default_SubstitutionBoxes = [
    [  4, 10,  9,  2, 13,  8,  0, 14,  6, 11,  1, 12,  7, 15,  5,  3 ],
    [ 14, 11,  4, 12,  6, 13, 15, 10,  2,  3,  8,  1,  0,  7,  5,  9 ],
    [  5,  8,  1, 13, 10,  3,  4,  2, 14, 15, 12,  7,  6,  0,  9, 11 ],
    [  7, 13, 10,  1,  0,  8,  9, 15, 14,  4,  6, 12, 11,  2,  5,  3 ],
    [  6, 12,  7,  1,  5, 15, 13,  8,  4, 10,  9, 14,  0,  3, 11,  2 ],
    [  4, 11, 10,  0,  7,  2,  1, 13,  3,  6,  8,  5,  9, 12, 15, 14 ],
    [ 13, 11,  4,  1,  3, 15,  5,  9,  0, 10, 14,  7,  6,  8,  2, 12 ],
    [  1, 15, 13,  0,  5,  7, 10,  4,  9,  2,  3, 14,  6, 11,  8, 12 ]
]

/*
 *   key -- The meshing key is an array[8] of UInt32
 *  sBox -- substitution Boxes array[8][16] of UInt8
 *
 */

function GOST_28147(key, sBox) {
    this.key = key
    this.sBox = sBox|| Default_SubstitutionBoxes
    this.gamma = []
}

// gamma -- 2 UInt32
GOST_28147.prototype.setGamma = function (gammaL, gammaH) {
    this.gamma[0] = gammaL
    this.gamma[1] = gammaH
}

GOST_28147.prototype.execute_gammingMode = function (n_int32, block, encode) {
    if (n_int32 > 32) {
        n_int32 = 32;
    }

    var f = [];
    for (var i = 0; i < (n_int32 + 1) * 8; i++) {
        if (i % 8 == 0) {
            this.calcNewGamma(encode);
            f[0] = this.gamma[0];
            f[1] = this.gamma[1];
        }
        var h  = (i % 8 < 4) ? 0 : 1;
        block[i] = (block[i] ^ f[h]) >>> 0;
        f[h] = (this.gamma[h] >> ((i % 4 + 1) * 8)) >>> 0;
    }
}

GOST_28147.prototype.calcNewGamma = function (encrypt) {
    const C1 = 0x01010101;
    const C2 = 0x01010104;

    this.gamma[0] = (this.gamma[0] + C1 ) % 0xffffffff ;
    this.gamma[1] = (this.gamma[1] + C2 - 1) % 0xffffffff + 1;

    for (var j = 0; j < 32; j++) {
        var keyIndex = this.getKeyIndex(j, encrypt);
        var subKey = this.key[keyIndex];

        var round = (this.gamma[1] ^ this.calcF(this.gamma[0], subKey) >>> 0);
        this.gamma[1] = this.gamma[0];
        this.gamma[0] = round;
    }
    swapArray2(this.gamma);
}

GOST_28147.prototype.calcF = function (val_i32, subKey_i32) {
    val_i32 = (val_i32 + subKey_i32) & 0xffffffff;
    val_i32 = this.substitute(val_i32);
    val_i32 = (val_i32 << 11 | val_i32 >>> 21);

    return val_i32;
}

GOST_28147.prototype.substitute = function (val_i32) {
    var sBlock, index;
    var result = 0;
    for (var i = 0; i < 8; i++) {
        if (i > 0) {
            val_i32 = val_i32 >>> 4;
        }
        index = val_i32 & 0x0f;
        sBlock = this.sBox[i][index];
        result |= (sBlock << 32-4)
        if (i < 7) {
            result >>>= 4;
        }
    }
    return result;
}

GOST_28147.prototype.getKeyIndex = function (i, encrypt) {
    return encrypt ?
        ((i < 24) ? i % 8 : 7 - (i % 8)):
        ((i <  8) ? i % 8 : 7 - (i % 8))
}

function swapArray2(array_i32) {
    var tmp = array_i32[1];
    array_i32[1] = array_i32[0];
    array_i32[0] = tmp;
}

module.exports = GOST_28147;
