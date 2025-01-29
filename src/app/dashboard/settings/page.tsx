'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type Category = {
  id: string
  name: string
  created_at: string
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClientComponentClient()

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim() || addingCategory) return

    setAddingCategory(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) throw new Error('No user session')

      const newCategory = {
        name: newCategoryName.trim(),
        user_id: session.user.id
      }

      const { error } = await supabase
        .from('asset_categories')
        .insert([newCategory])

      if (error) throw error

      setNewCategoryName('')
      setIsOpen(false)
      fetchCategories()
    } catch (error) {
      console.error('Error:', error)
      setError('Ralat semasa menambah kategori')
    } finally {
      setAddingCategory(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    setError('')

    try {
      const { error } = await supabase
        .from('asset_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchCategories()
    } catch (error) {
      console.error('Error:', error)
      setError('Ralat semasa memadam kategori')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-500">Senarai Kategori Aset</h1>
              <p className="text-gray-600 mt-1">
                Urus kategori aset untuk anak-anak anda
              </p>
            </div>
            <Button 
              onClick={() => setIsOpen(true)}
              className="bg-yellow-400 text-gray-700 hover:bg-yellow-300 w-full sm:w-auto"
            >
              Tambah Kategori
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mt-4">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-2">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700 font-medium">{category.name}</span>
                <Button
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={deletingId === category.id}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  {deletingId === category.id ? 'Memadam...' : 'Padam'}
                </Button>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Tiada kategori. Sila tambah kategori baru.
            </div>
          )}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kategori
                </label>
                <Input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Masukkan nama kategori"
                  required
                  disabled={addingCategory}
                />
              </div>
              <Button 
                type="submit"
                disabled={addingCategory}
                className="w-full bg-blue-500 hover:bg-blue-400"
              >
                {addingCategory ? 'Sedang simpan...' : 'Simpan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}