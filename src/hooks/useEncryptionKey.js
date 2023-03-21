import { useState, useEffect } from 'react'
import b4a from 'b4a'

function useEncryptionKey(encryptionKeyValue,setCoreOptions) {
  const [encryptionKey, setEncryptionKey] = useState(encryptionKeyValue)

  useEffect(() => {
    if (!encryptionKey || encryptionKey.length !== 64) {
      setCoreOptions(prev => ({ ...prev, encryptionKey: null }))
      return
    }
    // + z32
    setCoreOptions(prev => ({ ...prev, encryptionKey: b4a.from(encryptionKey, 'hex') }))
  }, [encryptionKey])

  return [encryptionKey, setEncryptionKey]
}

export default useEncryptionKey