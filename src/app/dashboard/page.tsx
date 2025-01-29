'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LogOut } from 'lucide-react'

type Child = {
  id: string
  name: string
  birthdate: string
  total_assets: number
  created_at: string
}

function calculateAge(birthdate: string) {
  const birth = new Date(birthdate)
  const today = new Date()
  
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  return { years, months }
}

function formatAge(birthdate: string) {
  const { years, months } = calculateAge(birthdate)
  return `${years} tahun ${months} bulan`
}

export default function DashboardPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [totalAssets, setTotalAssets] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [birthdate, setBirthdate] = useState('')
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
    if (!newChildName.trim() || !birthdate || addingChild) return

    setAddingChild(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) throw new Error('No user session')

      const newChild = {
        name: newChildName.trim(),
        birthdate,
        user_id: session.user.id
      }

      const { error } = await supabase
        .from('children')
        .insert([newChild])

      if (error) throw error

      setNewChildName('')
      setBirthdate('')
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
    <div className="min-h-screen bg-gray-50">

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-500">Senarai Anak</h1>
              <p className="text-gray-600 mt-1">
                Jumlah Semua Aset: RM {totalAssets.toLocaleString('ms-MY', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              </p>
            </div>
            <Button 
              onClick={() => setIsOpen(true)}
              className="bg-yellow-400 text-gray-700 hover:bg-yellow-300 w-full sm:w-auto"
            >
              Tambah Anak
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mt-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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
                <p className="text-gray-600 mb-2">
                  Umur: {formatAge(child.birthdate)}
                </p>
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
            <div className="text-center text-gray-500 mt-8">
              Tiada rekod anak. Sila tambah anak baru.
            </div>
          )}
        </div>

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarikh Lahir
                </label>
                <Input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  required
                  disabled={addingChild}
                  max={new Date().toISOString().split('T')[0]}
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