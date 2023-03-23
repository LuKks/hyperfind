import { useState, useEffect } from 'react'
import { Button } from 'reactstrap'
import { SpanTitle } from 'components'
import b4a from 'b4a'

function BlockPages ({ core, lookup, coreAppend }) {
  const [blocks, setBlocks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [blockPerPage] = useState(10)
  const [maxPages, setMaxPages] = useState(0)

  const indexOfLastBlock = currentPage * blockPerPage
  const indexOfFirstBlock = indexOfLastBlock - blockPerPage

  useEffect(() => {
    if (!lookup || core === null) {
      setBlocks([])
      return
    }

    setBlocks([])

    let cleanup = false

    main()

    async function main () {
      try {
        setMaxPages(Math.ceil(core.length / blockPerPage))

        const max = Math.min(indexOfFirstBlock + blockPerPage, core.length)

        for (let i = indexOfFirstBlock; i < max; i++) {
          // + prefetch next
          const value = await core.get(i, { timeout: 15000 })
          if (cleanup) return

          const first = i === indexOfFirstBlock
          if (first && !value) return
          if (!value) break

          const block = { index: i, value: b4a.toString(value) }
          setBlocks(prev => first ? [block] : [...prev, block])
        }

        return
      } catch {}

      setBlocks([])
    }

    return () => {
      cleanup = true
    }
  }, [lookup, core, currentPage, coreAppend])

  function onNextPage () {
    if (currentPage >= maxPages) return
    setCurrentPage(currentPage + 1)
  }

  function onPrevPage () {
    if (currentPage <= 1) return
    setCurrentPage(currentPage - 1)
  }

  if (!core || !lookup) return null

  return (
    <>
      <SpanTitle>Blocks</SpanTitle>

      {blocks.length > 0
        ? (
            blocks.map(block => {
              return (
                <div key={'block-' + block.index}>
                  <span className='span-block-section'>#{block.index}</span>&nbsp;<span>{block.value}</span>
                </div>
              )
            }))
        : (<div>Loading...</div>)}

      <div style={{ marginTop: '10px' }}>
        <Button onClick={onPrevPage} style={{ marginLeft: '2px', marginRight: '2px', borderRadius: 0, background: '#2e3344' }}>&#8249;Prev</Button>
        <Button onClick={onNextPage} style={{ marginLeft: '2px', marginRight: '2px', borderRadius: 0, background: '#2e3344' }}>Next&#8250;</Button>
      </div>

    </>
  )
}

export default BlockPages
