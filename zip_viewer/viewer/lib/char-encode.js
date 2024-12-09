const chardet = require('chardet')
const iconv = require('iconv-lite')

const charEncode = (binary) => {
  const encoding = chardet.detect(binary)
  if (encoding === 'UTF-8') {
    return binary.toString()
  } else {
    return iconv.decode(binary, 'shift_jis')
  }
}

module.exports = charEncode