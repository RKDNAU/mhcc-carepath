// Lightweight AES-256-GCM encrypt/decrypt for PII columns.
// Prototype-grade: key is sourced from env, falls back to a hardcoded dev key.
// Replace SERVER_ENCRYPTION_KEY with a real secret before handling real data.
const crypto = require('crypto')

const ALGORITHM = 'aes-256-gcm'
const DEV_KEY = 'mhcc-dev-key-32-bytes-padding!!!' // exactly 32 bytes
const KEY = Buffer.from(process.env.SERVER_ENCRYPTION_KEY || DEV_KEY, 'utf8').slice(0, 32)

function encrypt(plaintext) {
  if (plaintext == null) return null
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

function decrypt(ciphertext) {
  if (ciphertext == null) return null
  const buf = Buffer.from(ciphertext, 'base64')
  const iv = buf.slice(0, 12)
  const tag = buf.slice(12, 28)
  const encrypted = buf.slice(28)
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

module.exports = { encrypt, decrypt }
