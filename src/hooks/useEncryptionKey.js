import { useState } from 'react'
import b4a from 'b4a'

export const useEncryptionKey = defaultValue => {
  const [value, setValue] = useState(defaultValue || '')
  const key = value && value.length === 64 ? b4a.from(value, 'hex') : null

  return { value, setValue, key }
}
