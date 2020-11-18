function mod(x, y) {
    return x - y * parseInt(String(x / y), 10)
}

function idToCode(id, interacao = 3) {
    let code;
    code = ''
    const hash = "0123456789@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    numCaract = String(id).length

    for (let index = 0; index < interacao; index++) {
        var numDec = parseInt(String(id).substr((index * (numCaract / interacao)), (numCaract / interacao)), 16)
        var restDivInt = mod(numDec, 63)
        code = code + hash.substr(restDivInt, 1)
    }

    return code
}


const gerarCode = async (userId, cultoId,) => {
    let hash;
    if (cultoId) {
        hash = idToCode(userId) + idToCode(cultoId)
    } else {
        hash = idToCode(userId, 6)
    }

    const code = cultoId ? { userId: userId, cultoId: cultoId, token: hash } : { userId: userId, token: hash }
    return code
}

module.exports = gerarCode;