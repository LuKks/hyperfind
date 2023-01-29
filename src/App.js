import { useState, useEffect } from 'react'

import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Row, Col } from 'reactstrap'
import { Form, FormGroup, Label, Input, Button } from 'reactstrap'

import b4a from 'b4a'
import z32 from 'z32'

import useDHT from 'hooks/use-dht.js'
import useSwarm from 'hooks/use-swarm.js'
import useCore from 'hooks/use-core.js'

import RAM from 'random-access-memory'

function App () {
  const [dht] = useDHT()
  const [swarm] = useSwarm(dht)

  const [search, setSearch] = useState('')
  const [lookup, setLookup] = useState(null)
  const [encryptionKey, setEncryptionKey] = useState('')
  const [coreIndex, setCoreIndex] = useState(0)

  const [blocks, setBlocks] = useState([])

  const [core, coreOptions, setCoreOptions] = useCore(RAM, lookup)

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

  useEffect(() => {
    if (!encryptionKey || encryptionKey.length !== 64) {
      setCoreOptions(prev => ({ ...prev, encryptionKey: null }))
      return
    }
    // + z32
    setCoreOptions(prev => ({ ...prev, encryptionKey: b4a.from(encryptionKey, 'hex') }))
  }, [encryptionKey])

  return (
    <div className="bg-dark custom-body" style={{ fontSize: '1.2rem' }}>
      <Container>
        <br />

        <Row>
          <Col xs={10}>
            <Input type="text" placeholder="Find core by key" onChange={onsearchchange} value={search} />
          </Col>

          <Col xs={2}>
            <Input type="number" placeholder="Write a core index" onChange={onindexchange} value={coreIndex} />
          </Col>

          <br />
          <br />

          <Col xs={10}>
            <Input type="password" placeholder="Encryption key (optional)" onChange={onencryptionkey} value={encryptionKey} />
          </Col>

          {/* <Col>
            <Button color="primary" onclick={onclicklookup}>Lookup</Button>
          </Col> */}
        </Row>

        <br />

        <PrintCore core={core} />
        <PrintBlocks core={core} blocks={blocks} />
      </Container>
    </div>
  )
}

function PrintCore ({ core }) {
  if (!core) return null

  return (
    <>
      <span style={{ color: '#8957e5' }}>CORE</span>
      <br />

      <span style={{ color: '#3fb950' }}>ID</span> <span style={{ color: '#58a6ff' }}>{core.id}</span><br/>
      <span style={{ color: '#3fb950' }}>Length</span> {core.length}<br/>
      <span style={{ color: '#3fb950' }}>Peers</span> {core.peers.length}<br />
      <br />
    </>
  )
}

function PrintBlocks ({ core, blocks }) {
  if (!core) return null

  return (
    <>
      <span style={{ color: '#8957e5' }}>BLOCKS</span>
      <br />

      {blocks.map(block => {
        return (
          <div key={'block-' + block.index}>
            <span style={{ color: 'yellow' }}>#{block.index}</span>&nbsp;<span style={{ color: '#58a6ff' }}>{block.value}</span>
            <br />
          </div>
        )
      })}
      <br />
    </>
  )
}

export default App
