

// ローマ字変換用のライブラリを使用
function toRomaji(str: string) {
  return str.normalize('NFKD').replace(/[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF]/g, char =>
    char.charCodeAt(0).toString(36)
  )
}

// 簡易ハッシュ関数 (SHA-256の一部を利用)
async function hashString(input: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).slice(0, 10).map(b => b.toString(36)).join('')
}

const generateHash = async (input: string): Promise<string> => {
  const romaji = toRomaji(input)
  const hashed = await hashString(romaji)
  return hashed.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
}

export default generateHash