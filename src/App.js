import { useState, useEffect } from 'react'

import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Row, Col } from 'reactstrap'

import { PrintBlocks, PrintCore, CustomInput } from 'components'

import { useLookup, useEncryptionKey } from 'hooks'

import b4a from 'b4a'

import useDHT from 'use-hyper/dht'
import useSwarm from 'use-hyper/swarm'
import useCore from 'use-hyper/core'

import RAM from 'random-access-memory'

function App () {
  const [dht] = useDHT()
  const [swarm] = useSwarm(dht)

  const [search, setSearch, lookup] = useLookup('')

  const [coreIndex, setCoreIndex] = useState(0)

  const [blocks, setBlocks] = useState([])

  const [core, , setCoreOptions] = useCore(RAM, lookup)

  const [encryptionKey, setEncryptionKey] = useEncryptionKey('', setCoreOptions)

  useEffect(() => {
    console.log('lookup', lookup)
    if (!dht || !lookup || !core) return
    // + this part should be locked, to make the cleanup is safe

    swarm.on('connection', onsocket)
    swarm.join(core.discoveryKey, { server: false, client: true })

    const done = core.findingPeers()
    swarm.flush().then(done, done)

    function onsocket (socket) {
      console.log('new replicator')
      core.replicate(socket)
    }

    for (const socket of swarm.connections) {
      core.replicate(socket)
    }

    return () => {
      console.log('cleaning replicator')
      swarm.off('connection', onsocket)
      swarm.leave(core.discoveryKey)
    }
  }, [dht, lookup, core])

  //

  function onindexchange (e) {
    const index = Number(e.target.value)
    if (isNaN(index)) return

    setCoreIndex(index)
  }

  useEffect(() => {
    if (!lookup || core === null) {
      console.log('can not download yet')
      setBlocks([])
      return
    }

    console.log('start downloads')

    setBlocks([])

    main()

    async function main () {
      try {
        await core.update({ wait: true })

        const max = Math.min(coreIndex + 1, core.length)

        for (let i = coreIndex; i < max; i++) {
          console.log('getting', i)
          const value = await core.get(i, { timeout: 15000 })

          const first = i === coreIndex
          if (first && !value) return
          if (!value) break

          const block = { index: i, value: b4a.toString(value) }
          setBlocks(prev => first ? [block] : [...prev, block])
        }

        return
      } catch {}

      setBlocks([])
    }
  }, [lookup, core, coreIndex])

  function onsearchchange (e) {
    setSearch(e.target.value)
  }

  //

  function onencryptionkey (e) {
    setEncryptionKey(e.target.value)
  }

  return (
    <div className='custom-body body-dark'>
      <Container>
        <br />
        <Row style={{ justifyContent: 'center' }}>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '2em,', marginBottom: '20px' }}>
              Hypercore Explorer
            </h1>
          </Col>
          <br />
          <br />
          <Col xs={6}>
            <CustomInput type='text' placeholder='Find core by key' onChange={onsearchchange} value={search} />
          </Col>

          <Col xs={2}>
            <CustomInput type='number' placeholder='Write a core index' onChange={onindexchange} value={coreIndex} />
          </Col>

          <br />
          <br />

          <Col xs={8}>
            <CustomInput type='password' placeholder='Encryption key (optional)' onChange={onencryptionkey} value={encryptionKey} />
          </Col>
          <br />
          <br />

          {/* <Col>
            <Button color="primary" onclick={onclicklookup}>Lookup</Button>
          </Col> */}
          <br />
          <Col xs={8} style={{ marginTop: '10px' }}>
            <PrintCore core={core} />
            <PrintBlocks core={core} blocks={blocks} />
          </Col>
        </Row>

        <br />

        {/* <PrintBlocks core={core} blocks={blocks} /> */}
      </Container>
    </div>
  )
}

export default App
