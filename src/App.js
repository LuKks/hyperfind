import { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'reactstrap';

import { PrintBlocks, PrintCore, CustomInput } from 'components';

import b4a from 'b4a';
import z32 from 'z32';

import useDHT from 'use-hyper/dht';
import useSwarm from 'use-hyper/swarm';
import useCore from 'use-hyper/core';

import RAM from 'random-access-memory';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

function App () {
  const [dht] = useDHT();
  const [swarm] = useSwarm(dht);

  const [search, setSearch] = useState('');
  const [lookup, setLookup] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [coreIndex, setCoreIndex] = useState(0);

  const [blocks, setBlocks] = useState([]);

  const [darkTheme, setDarkTheme] = useState(true);
  const [themeClass, setThemeClass] = useState('body-dark')
  const [themeIcon, setThemeIcon] = useState(faSun)

  const [core, coreOptions, setCoreOptions] = useCore(RAM, lookup);

  useEffect(() => {
    console.log('search', search);

    // + use hypercore-id-encoding

    if (search.length === 52) {
      try {
        setLookup(z32.decode(search));
        return;
      } catch {}
    } else if (search.length === 64) {
      setLookup(b4a.from(search, 'hex'));
      return;
    }

    setLookup(null);
  }, [search]);

  useEffect(() => {
    console.log('lookup', lookup)
    if (!dht || !lookup || !core) return;
    // + this part should be locked, to make the cleanup is safe

    swarm.on('connection', onsocket);
    swarm.join(core.discoveryKey, { server: false, client: true });

    const done = core.findingPeers();
    swarm.flush().then(done, done);

    function onsocket (socket) {
      console.log('new replicator')
      core.replicate(socket);
    }

    for (const socket of swarm.connections) {
      core.replicate(socket);
    }

    return () => {
      console.log('cleaning replicator');
      swarm.off('connection', onsocket);
      swarm.leave(core.discoveryKey);
    }
  }, [dht, lookup, core]);

  //

  function onindexchange (e) {
    const index = Number(e.target.value);
    if (isNaN(index)) return;

    setCoreIndex(index);
  }

  useEffect(() => {
    if (!lookup || core === null) {
      console.log('can not download yet');
      setBlocks([]);
      return;
    }

    console.log('start downloads');

    setBlocks([]);

    main();

    async function main () {
      try {
        await core.update({ wait: true });

        const max = Math.min(coreIndex + 1, core.length);

        for (let i = coreIndex; i < max; i++) {
          console.log('getting', i);
          const value = await core.get(i, { timeout: 15000 });

          const first = i === coreIndex;
          if (first && !value) return;
          if (!value) break;

          const block = { index: i, value: b4a.toString(value) };
          setBlocks(prev => first ? [block] : [...prev, block]);
        }

        return
      } catch {}

      setBlocks([]);
    }
  }, [lookup, core, coreIndex]);

  function onsearchchange (e) {
    setSearch(e.target.value);
  }

  //

  function onencryptionkey (e) {
    setEncryptionKey(e.target.value);
  }

  useEffect(() => {
    if (!encryptionKey || encryptionKey.length !== 64) {
      setCoreOptions(prev => ({ ...prev, encryptionKey: null }));
      return;
    }
    // + z32
    setCoreOptions(prev => ({ ...prev, encryptionKey: b4a.from(encryptionKey, 'hex') }));
  }, [encryptionKey]);

// Theme swap useEffect and onClick function

  // useEffect(() => {
  //   if (!darkTheme) {
  //     setThemeClass('body-light')
  //     setThemeIcon(faMoon)
  //   }
  //   if (darkTheme) {
  //     setThemeClass('body-dark')
  //     setThemeIcon(faSun)
  //   }
  // }, [darkTheme])

  // function themeOnClick() {
  //   setDarkTheme(!darkTheme)
  // }

  return (
    <div className={`custom-body ${themeClass}`}>
      <Container>
        <br />
        <Row style={{ justifyContent: 'center' }}>
          <Col xs={3}/>
          <Col xs={6} style={{ display: 'flex', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '2em,', marginBottom: '20px' }}>
              Hypercore Explorer
            </h1>
          </Col>
          <Col>
            {/* <FontAwesomeIcon onClick={themeOnClick} className='theme-switch' icon={themeIcon} /> */}
          </Col>
          <br/>
          <br/>
          <Col xs={6}>
            <CustomInput type="text" placeholder="Find core by key" onChange={onsearchchange} value={search}/>
          </Col>

          <Col xs={2}>
            <CustomInput type="number"  placeholder="Write a core index" onChange={onindexchange} value={coreIndex} />
          </Col>

          <br />
          <br />

          <Col xs={8}>
            <CustomInput type="password"  placeholder="Encryption key (optional)" onChange={onencryptionkey} value={encryptionKey} />
          </Col>
          <br/>
          <br/>

          {/* <Col>
            <Button color="primary" onclick={onclicklookup}>Lookup</Button>
          </Col> */}
          <br/>
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

export default App;
