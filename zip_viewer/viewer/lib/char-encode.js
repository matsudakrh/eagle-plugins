import chardet from 'chardet'
import { decode } from 'iconv-lite'

const charEncode = (binary) => {
  const encoding = chardet.detect(binary)
  if (encoding === 'UTF-8') {
    return binary.toString()
  } else {
    return decode(binary, 'shift_jis')
  }
}

export default charEncode