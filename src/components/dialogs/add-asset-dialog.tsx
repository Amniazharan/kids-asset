'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Category = {
  id: string
  name: string
}

interface AddAssetDialogProps {
  childId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssetAdded: () => void
  onSuccess: () => void
}

const goldTypes = [
  { id: '999', name: 'Emas 999 (24K)' },
  { id: '916', name: 'Emas 916 (22K)' },
  { id: '750', name: 'Emas 750 (18K)' },
  { id: '585', name: 'Emas 585 (14K)' },
]

export default function AddAssetDialog({ 
  open, 
  onOpenChange, 
  childId,
  onSuccess 
}: AddAssetDialogProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [weight, setWeight] = useState('')
  const [goldType, setGoldType] = useState('999')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('asset_categories')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setCategories(data)
    } catch (error) {
      console.error('Error:', error)
      setError('Ralat semasa mendapatkan kategori')
    }
  }

  const resetForm = () => {
    setSelectedCategoryId('')
    setAmount('')
    setWeight('')
    setGoldType('999')
    setNote('')
    setError('')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  const selectedCategory = categories.find(c => c.id === selectedCategoryId)
  const isGoldCategory = selectedCategory?.name === 'Emas'

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategoryId || !amount || loading) return

    if (isGoldCategory && (!weight || !goldType)) {
      setError('Sila isi semua maklumat emas')
      return
    }

    setLoading(true)
    setError('')

    try {
      const newAsset = {
        child_id: childId,
        category_id: selectedCategoryId,
        amount: parseFloat(amount),
        note: note.trim() || null,
        metadata: isGoldCategory ? {
          weight: parseFloat(weight),
          type: goldType
        } : null
      }

      const { error } = await supabase
        .from('assets')
        .insert([newAsset])

      if (error) throw error

      resetForm()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error:', error)
      setError('Ralat semasa menambah aset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Aset Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleAddAsset} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 px-3 py-2
                focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nilai (RM)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Masukkan nilai dalam RM"
              required
              disabled={loading}
            />
          </div>

          {isGoldCategory && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Berat (gram)
                </label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.000"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Emas
                </label>
                <select
                  value={goldType}
                  onChange={(e) => setGoldType(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2
                    focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  {goldTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota (Pilihan)
            </label>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Emas 916"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-400"
            >
              {loading ? 'Sedang simpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}