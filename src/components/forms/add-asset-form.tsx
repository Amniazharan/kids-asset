'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type AssetCategory = {
  id: string
  name: string
}

interface AddAssetFormProps {
  childId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssetAdded: () => void
}

const goldTypes = [
  { id: '999', name: 'Emas 999 (24K)' },
  { id: '916', name: 'Emas 916 (22K)' },
  { id: '750', name: 'Emas 750 (18K)' },
  { id: '585', name: 'Emas 585 (14K)' },
]

export function AddAssetForm({ childId, open, onOpenChange, onAssetAdded }: AddAssetFormProps) {
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
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
      const { data, error } = await supabase
        .from('asset_categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data)
      if (data.length > 0) setSelectedCategory(data[0].id)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Ralat semasa mendapatkan kategori')
    }
  }

  const resetForm = () => {
    setAmount('')
    setWeight('')
    setGoldType('999')
    setNote('')
    setError('')
  }

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name
  const isGoldCategory = selectedCategoryName === 'Emas'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCategory || !amount || loading) {
      return
    }

    if (isGoldCategory && !weight) {
      setError('Sila isi berat emas')
      return
    }
  
    setLoading(true)
    setError('')
  
    try {
      const numericAmount = parseFloat(amount.replace(/,/g, ''))
      
      const assetData = {
        child_id: childId,
        category_id: selectedCategory,
        amount: numericAmount,
        note: note.trim() || null,
        metadata: isGoldCategory ? {
          weight: parseFloat(weight),
          type: goldType
        } : null
      }
  
      const { error } = await supabase
        .from('assets')
        .insert([assetData])
        .select()
  
      if (error) throw error
  
      resetForm()
      onOpenChange(false)
      onAssetAdded()
    } catch (error: any) {
      console.error('Detailed error:', error)
      setError(error.message || 'Ralat semasa menambah aset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Aset Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2
                focus:border-blue-500 focus:ring-blue-500"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah (RM)
            </label>
            <Input
              type="text"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '')
                setAmount(value)
              }}
              placeholder="0.00"
              required
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
              placeholder="Contoh: ASB 1"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-400"
          >
            {loading ? 'Sedang simpan...' : 'Simpan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}