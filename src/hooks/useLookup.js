import { useState, useEffect, useContext, createContext } from 'react'
import b4a from 'b4a'
import z32 from 'z32'
import { useEncryptionKey } from './useEncryptionKey'
import { useNavigate } from 'react-router-dom'

const LookupContext = createContext()

export const LookupProvider = ({ children, defaultSeach }) => {
  const [lookup, setLookup] = useState(null)
  const [search, setSearch] = useState(defaultSeach || '')
  const encryption = useEncryptionKey()
  const navigate = useNavigate()
  useEffect(() => {
    // + use hypercore-id-encoding
    navigate(search, { replace: true })

    if (search.length === 52) {
      try {
        setLookup(z32.decode(search))
        return
      } catch {}
    } else if (search.length === 64) {
      setLookup(b4a.from(search, 'hex'))
      return
    }

    setLookup(null)
  }, [search])

  return (
    <LookupContext.Provider
      value={{
        lookup,
        searchValue: search,
        setSearchValue: setSearch,
        encryptionKey: encryption.key,
        encryptionValue: encryption.value,
        setEncryptionValue: encryption.setValue
      }}
    >
      {children}
    </LookupContext.Provider>
  )
}

export const useLookup = () => {
  const context = useContext(LookupContext)

  if (context === undefined) {
    throw new Error('useLookup must be used within a Lookup component')
  }

  return context
}
