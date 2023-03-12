import { useEffect, useState } from 'react'
import Hyperswarm from 'hyperswarm'

export default function useDHT (dht) {
  const [swarm, setSwarm] = useState(null)

  useEffect(() => {
    if (!dht) return

    const swarm = new Hyperswarm({ dht, keyPair: dht.defaultKeyPair })

    setSwarm(swarm)

    return () => {
      // console.log('hook swarm cleanup')
      swarm.destroy()
      for (const socket of swarm.connections) socket.destroy()
    }
  }, [dht])

  return [swarm]
}
