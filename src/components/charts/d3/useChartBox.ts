'use client'

import { useLayoutEffect, useRef, useState } from 'react'

type Size = { w: number; h: number }

/** Mede a caixa (100% × altura) com useLayoutEffect + ResizeObserver, para o primeiro paint com largura &gt; 0 quando o layout do pai já existe. */
export function useChartBox(defaultHeight: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size>({ w: 0, h: defaultHeight })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const read = () => {
      const r = el.getBoundingClientRect()
      const nw = Math.max(0, Math.floor(r.width))
      const nh = Math.max(1, Math.floor(r.height) || defaultHeight)
      setSize((s) => (s.w === nw && s.h === nh ? s : { w: nw, h: nh }))
    }
    read()
    const ro = new ResizeObserver(() => read())
    ro.observe(el)
    return () => ro.disconnect()
  }, [defaultHeight])

  return { ref, w: size.w, h: size.h }
}
