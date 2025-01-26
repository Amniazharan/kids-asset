import { useEffect, useRef } from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className="backdrop:bg-black/50 p-0 bg-transparent"
      onClick={(e) => {
        if (e.target === ref.current) onOpenChange(false)
      }}
    >
      <div className="bg-white rounded-lg p-6 min-w-[300px]">
        {children}
      </div>
    </dialog>
  )
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold">{children}</h2>
}