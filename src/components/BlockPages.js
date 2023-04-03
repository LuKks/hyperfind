import { useState, useEffect } from 'react'
import { useCore, useCoreWatch } from 'use-hyper/core'
import { Button } from 'reactstrap'
import { SpanTitle } from 'components'
import { useLookup } from 'hooks'
import { isHyperbee } from 'hyperbee'
import b4a from 'b4a'

function BlockPages ({ defaultPage }) {
  const { core } = useCore()
  const { lookup } = useLookup()
  const [blocks, setBlocks] = useState(null)
  const [currentPage, setCurrentPage] = usePage(defaultPage || 1)
  const [blockPerPage] = useState(10)
  const [maxPages, setMaxPages] = useState(0)
  const { onwatch: onappend } = useCoreWatch(['append'])

  let indexOfLastBlock = blockPerPage
  if (currentPage > 1) indexOfLastBlock = currentPage * blockPerPage
  const indexOfFirstBlock = indexOfLastBlock - blockPerPage

  useEffect(() => {
    setBlocks(null)

    if (!lookup || core === null) return

    let cleanup = false

    main()

    async function main () {
      try {
        setMaxPages(Math.ceil(core.length / blockPerPage))

        const max = Math.min(indexOfLastBlock, core.length)

        async function coreType (coreObj, index) {
          if (!(await isHyperbee(coreObj))) return 'Hypercore'

          const value = b4a.toString(await core.get(index, { timeout: 15000 }))
          if (value.includes('hyperbee')) return 'Hyperbee'

          return 'Hyperdrive'
        }

        if (indexOfFirstBlock === 0) {
          const typeOfCore = await coreType(core, indexOfFirstBlock)
          const block = { index: 0, value: typeOfCore }
          setBlocks([block])
        }

        for (let i = indexOfFirstBlock; i < max; i++) {
          // + prefetch next
          if (i === 0) continue
          const value = await core.get(i, { timeout: 15000 })
          if (cleanup) return

          const first = i === indexOfFirstBlock
          if (first && !value) return
          if (!value) break

          const block = { index: i, value: b4a.toString(value) }
          setBlocks(prev => (first ? [block] : [...prev, block]))
        }

        return
      } catch {}

      setBlocks(null)
    }

    return () => {
      cleanup = true
    }
  }, [lookup, core, currentPage, onappend])

  function onNextPage () {
    if (currentPage >= maxPages) return
    setCurrentPage(currentPage + 1)
  }

  function onPrevPage () {
    if (currentPage <= 1) return
    setCurrentPage(currentPage - 1)
  }

  if (!core || !lookup) return null

  const renderBlock = block => (
    <div key={'block-' + block.index}>
      <span className='span-block-section'>#{block.index}</span>&nbsp;
      <span>{block.value}</span>
      <br />
    </div>
  )

  return (
    <>
      <SpanTitle>Blocks</SpanTitle>

      <section className='button-section'>
        <Button onClick={onPrevPage} className='custom-button prev-button'>
          &#8249;Prev
        </Button>
        <span>{currentPage}/{maxPages}</span>
        <Button onClick={onNextPage} className='custom-button next-button'>
          Next&#8250;
        </Button>
      </section>

      {blocks ? blocks.map(renderBlock) : <div>Loading...</div>}
    </>
  )
}

function usePage (defaultPage) {
  const [page, setPage] = useState(defaultPage || 1)
  if (page < 0) setPage(0)
  return [page, setPage]
}

export default BlockPages
export { usePage }
