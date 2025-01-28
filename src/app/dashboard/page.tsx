'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type Child = {
  id: string
  name: string
  total_assets: number
  created_at: string
}

export default function DashboardPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [totalAssets, setTotalAssets] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [addingChild, setAddingChild] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  const fetchChildren = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) return

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select(`
          *,
          assets (
            amount
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (childrenError) throw childrenError

      let overallTotal = 0
      const childrenWithTotals = childrenData.map((child: any) => {
        const childTotal = child.assets?.reduce((sum: number, asset: any) => 
          sum + (asset.amount || 0), 0) || 0
        overallTotal += childTotal
        return {
          ...child,
          total_assets: childTotal
        }
      })

      setChildren(childrenWithTotals)
      setTotalAssets(overallTotal)
    } catch (error) {
      console.error('Error in fetchChildren:', error)
      setError('Ralat semasa mendapatkan data anak')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChildName.trim() || addingChild) return

    setAddingChild(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) throw new Error('No user session')

      const newChild = {
        name: newChildName.trim(),
        user_id: session.user.id
      }

      const { error } = await supabase
        .from('children')
        .insert([newChild])

      if (error) throw error

      setNewChildName('')
      setIsOpen(false)
      fetchChildren()
    } catch (error: any) {
      console.error('Error in handleAddChild:', error)
      setError('Ralat semasa menambah anak')
    } finally {
      setAddingChild(false)
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
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-500">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Jumlah Semua Aset: RM {totalAssets.toLocaleString('ms-MY', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              onClick={() => setIsOpen(true)}
              className="bg-yellow-400 text-gray-700 hover:bg-yellow-300"
            >
              Tambah Anak
            </Button>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Log Keluar
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/dashboard/${child.id}`}
              className="block bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg font-semibold text-blue-500">
                  {child.name}
                </span>
              </div>
              <p className="text-gray-600">
                Jumlah Aset:{' '}
                <span className="font-semibold">
                  RM {child.total_assets.toLocaleString('ms-MY', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </span>
              </p>
            </Link>
          ))}
        </div>

        {children.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            Tiada rekod anak. Sila tambah anak baru.
          </p>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Anak Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Anak
                </label>
                <Input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="Masukkan nama anak"
                  required
                  disabled={addingChild}
                />
              </div>
              <Button 
                type="submit"
                disabled={addingChild}
                className="w-full bg-blue-500 hover:bg-blue-400"
              >
                {addingChild ? 'Sedang simpan...' : 'Simpan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}