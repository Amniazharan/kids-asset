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

export function AddAssetForm({ childId, open, onOpenChange, onAssetAdded }: AddAssetFormProps) {
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [amount, setAmount] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission started')
    console.log('Selected category:', selectedCategory)
    console.log('Amount:', amount)
    console.log('Child ID:', childId)
  
    if (!selectedCategory || !amount || loading) {
      console.log('Validation failed')
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
        note: note.trim() || null
      }
      
      console.log('Asset data to insert:', assetData)
  
      const { data, error } = await supabase
        .from('assets')
        .insert([assetData])
        .select()
  
      console.log('Supabase response:', { data, error })
  
      if (error) throw error
  
      setAmount('')
      setNote('')
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

