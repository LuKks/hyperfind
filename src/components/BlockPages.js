import { SpanTitle } from 'components'

import { useState, useEffect } from 'react'

import b4a from 'b4a'

function BlockPages({ core, lookup, coreUpdated}) {
  // if (!core) return null
  const [blocks, setBlocks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [blockPerPage] = useState(10)
  const [maxPages, setMaxPages] = useState(0)

  const indexOfLastBlock = currentPage * blockPerPage
  const indexOfFirstBlock = indexOfLastBlock - blockPerPage
  // const currentBlocks = blocks.slice(indexOfFirstBlock, indexOfLastBlock)

  useEffect(() => {
    console.log('block pages core length', core ? core.length : null)

    if (!lookup || core === null) {
      // console.log('can not download yet')
      setBlocks([])
      return
    }

    setBlocks([])

    let cleanup = false

    main()

    async function main () {
      try {
        // await core.update({ wait: true })

        setMaxPages(Math.ceil(core.length / blockPerPage))
        console.log('maxPages',maxPages, core.length / blockPerPage);

        const max = Math.min(indexOfFirstBlock + blockPerPage, core.length)

        for (let i = indexOfFirstBlock; i < max; i++) {
          // console.log('getting', i)
          const value = await core.get(i, { timeout: 15000 })
          if (cleanup) return console.log('block pages stop due cleanup')

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
      console.log('block pages cleanup')
      cleanup = true
    }
  }, [lookup, core, currentPage, coreUpdated])

  // console.log('maxPages', maxPages)

  function onNextPage() {
    if (currentPage >= maxPages) return
    setCurrentPage(currentPage + 1)
  }

  function onPrevPage() {
    if (currentPage <= 1) return
    setCurrentPage(currentPage - 1)
  }
  if (!core) return null

  console.log('BlockPages core length', core.length)
    
  return (
    <>
      <SpanTitle>Blocks</SpanTitle>
      <br />

      {blocks.length > 0 ? (
        blocks.map(block => {
          return (
            <div key={'block-' + block.index} style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
              <span className='span-block-section'>#{block.index}</span>&nbsp;<span>{block.value}</span>
              <br />
            </div>
          )
        })) : 
      (<div>Loading...</div>)
      }

      <button onClick={onPrevPage} >{"<"}</button>
      <button onClick={onNextPage} >{">"}</button>

      <br />
    </>
  )
}

export default BlockPages
