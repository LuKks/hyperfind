import { SpanSection, SpanTitle } from 'components'
import { useCoreWatch } from 'use-hyper'
import { useLookup } from 'hooks'

function PrintCore () {
  const { core } = useCoreWatch()
  const { lookup } = useLookup()

  if (!core || !lookup) return null

  return (
    <section className='print-core-section'>
      <SpanTitle>Core</SpanTitle>
      <SpanSection>ID <span style={{ color: '#58a6ff' }}>{core.id}</span></SpanSection>
      <SpanSection>Length <span>{core.length}</span></SpanSection>
      <SpanSection>Peers <span>{core.peers.length}</span></SpanSection>
    </section>
  )
}

export default PrintCore
