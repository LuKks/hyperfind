import { SpanSection, SpanTitle } from 'components'
import { useCore, useCoreWatch } from 'use-hyper/core'
import { useLookup } from 'hooks'

function PrintCore () {
  const { core } = useCore()
  const { lookup } = useLookup()
  useCoreWatch()

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
