import { SpanTitle } from 'components/index'

function PrintBlocks ({ core, blocks }) {
  if (!core) return null

  return (
    <>
      <SpanTitle>Blocks</SpanTitle>
      <br />

      {blocks.map(block => {
        return (
          <div key={'block-' + block.index}>
            <span className='span-block-section'>#{block.index}</span>&nbsp;<span>{block.value}</span>
            <br />
          </div>
        )
      })}
      <br />
    </>
  )
}

export default PrintBlocks
