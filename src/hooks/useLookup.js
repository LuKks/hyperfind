import { useState, useEffect } from 'react'
import b4a from 'b4a'
import z32 from 'z32'

function useLookup(searchValue = '') {
  const [lookup, setLookup] = useState(null)
  const [search, setSearch] = useState(searchValue)

  useEffect(() => {
    console.log('search', search)

    // + use hypercore-id-encoding

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

  return [search, setSearch, lookup]
}

export default useLookup
