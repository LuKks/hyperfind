import { useEffect, useState } from 'react'
import Hypercore from 'hypercore'
import b4a from 'b4a'

export default function useCore (storage, key) {
  const [core, setCore] = useState(null)
  const [options, setOptions] = useState({})

  useEffect(() => {
    console.log('use-core setup', key)
    if (!key) return

    // const opts = (isOptions(args[0]) ? args[0] : args[1]) || {}

    console.log('use-core creating core', key)
    const c = new Hypercore(storage, key, options)
    const promise = main().catch(console.error)

    return () => {
      console.log('use-core cleanup')

      promise.then(async () => {
        await c.close()
      })
    }

    async function main () {      
      await c.ready()
      setCore(c)
    }
  }, [storage, key, options])

  return [core, options, setOptions]
}

function isOptions (value) {
  return value && typeof value === 'object' && !b4a.isBuffer(value)
}
