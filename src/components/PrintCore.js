import { SpanSection, SpanTitle } from 'components/index'

function PrintCore ({ core, lookup }) {
  if (!core || !lookup) return null

  return (
    <>
      <SpanTitle>Core</SpanTitle>
      <br />

      <SpanSection>ID</SpanSection> <span style={{ color: '#58a6ff' }}>{core.id}</span><br />
      <SpanSection>Length</SpanSection> {core.length}<br />
      <SpanSection>Peers</SpanSection> {core.peers.length}<br />
      <br />
    </>
  )
}

export default PrintCore
