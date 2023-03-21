import { useState, useEffect } from 'react'

import Logo from 'images/196x196.png'

import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Row, Col } from 'reactstrap'

import { BlockPages, PrintCore, CustomInput } from 'components'

import { useLookup, useEncryptionKey } from 'hooks'

import useDHT from 'use-hyper/dht'
import useSwarm from 'use-hyper/swarm'
import useCore from 'use-hyper/core'

import RAM from 'random-access-memory'

function App () {
  const [dht] = useDHT()
  const [swarm] = useSwarm(dht)

  const [search, setSearch, lookup] = useLookup('')

  const [core, , setCoreOptions] = useCore(RAM, lookup)

  const [encryptionKey, setEncryptionKey] = useEncryptionKey('', setCoreOptions)

  const [coreUpdated, setCoreUpdated] = useState(0)

  useEffect(() => {
    if (core === null) return
    const onappend = () => setCoreUpdated(updated => updated + 1)
    core.on('append', onappend)
    return () => core.off('append', onappend)
  }, [core])

  useEffect(() => {
    if (!dht || !lookup || !core) return
    // + this part should be locked, to make the cleanup is safe

    swarm.on('connection', onsocket)
    swarm.join(core.discoveryKey, { server: false, client: true })

    const done = core.findingPeers()
    swarm.flush().then(done, done)

    function onsocket (socket) {
      core.replicate(socket)
    }

    for (const socket of swarm.connections) {
      core.replicate(socket)
    }

    return () => {
      swarm.off('connection', onsocket)
      swarm.leave(core.discoveryKey)
    }
  }, [dht, lookup, core])

  //

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
            <img src={Logo} alt='Hypercore Explorer Logo' width={70} />
          </Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '2em,', marginBottom: '20px', marginTop: '20px' }}>
              Hypercore Explorer
            </h1>
          </Col>
          <br />
          <br />
          <Col xs={8}>
            <CustomInput type='text' placeholder='Find core by key' onChange={onsearchchange} value={search} />
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
            {/* <PrintBlocks core={core} blocks={blocks} /> */}
            <BlockPages core={core} lookup={lookup} coreUpdated={coreUpdated} />
          </Col>
        </Row>

        <br />

        {/* <PrintBlocks core={core} blocks={blocks} /> */}
      </Container>
    </div>
  )
}

export default App
