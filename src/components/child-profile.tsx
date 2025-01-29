'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { AddAssetForm } from '@/components/forms/add-asset-form'
import { AssetList } from '@/components/shared/asset-list'
import EditAssetDialog from '@/components/dialogs/edit-asset-dialog'
import { ChevronLeft, Coins, Wallet, Building } from 'lucide-react'

interface ChildProfileProps {
  childId: string
}

type Child = {
  id: string
  name: string
}

type Asset = {
  id: string
  amount: number
  note: string | null
  metadata: {
    weight?: number
    type?: string
  } | null
  created_at: string
  category: {
    id: string
    name: string
  }
}

const goldTypeMap: { [key: string]: string } = {
  '999': 'Emas 999 (24K)',
  '916': 'Emas 916 (22K)',
  '750': 'Emas 750 (18K)',
  '585': 'Emas 585 (14K)',
}

const getCategoryIcon = (categoryName: string) => {
  switch (categoryName) {
    case 'ASB':
      return <Building className="w-6 h-6 text-blue-500" />
    case 'Emas':
      return <Coins className="w-6 h-6 text-yellow-500" />
    case 'Tunai':
      return <Wallet className="w-6 h-6 text-green-500" />
    default:
      return <Building className="w-6 h-6 text-gray-500" />
  }
}

export default function ChildProfile({ childId }: ChildProfileProps) {
  const [child, setChild] = useState<Child | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [totalAssets, setTotalAssets] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (childId) {
      fetchChildData()
    }
  }, [childId])

  const fetchChildData = async () => {
    if (!childId) return

    try {
      // Fetch child details
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single()

      if (childError) throw childError
      setChild(childData)

      // Fetch child's assets with categories
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select(`
          *,
          category:asset_categories(*)
        `)
        .eq('child_id', childId)
        .order('created_at', { ascending: false })

      if (assetsError) throw assetsError
      setAssets(assetsData)

      // Calculate total assets
      const total = assetsData.reduce((sum, asset) => sum + (asset.amount || 0), 0)
      setTotalAssets(total)
    } catch (error) {
      console.error('Error fetching child data:', error)
      setError('Ralat semasa mendapatkan data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChild = async () => {
    if (!confirm('Adakah anda pasti untuk memadam rekod anak ini?')) return

    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)

      if (error) throw error
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting child:', error)
      setError('Ralat semasa memadam rekod anak')
    }
  }

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
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

  if (!child) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600">Rekod anak tidak dijumpai</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Child Info */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-blue-500">{child.name}</h1>
          <p className="text-gray-600 mt-2">
            Jumlah Aset: RM {totalAssets.toLocaleString('ms-MY', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              onClick={() => setIsAddAssetOpen(true)}
              className="bg-yellow-400 text-gray-700 hover:bg-yellow-300"
            >
              Tambah Aset
            </Button>
            <Button
              onClick={handleDeleteChild}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Padam Anak
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mt-4">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((asset) => (
            <div 
              key={asset.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {getCategoryIcon(asset.category.name)}
                  <span className="ml-2 font-medium text-gray-900">
                    {asset.category.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditAsset(asset)}
                    variant="outline"
                    className="h-8 px-2 text-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm('Adakah anda pasti untuk memadam aset ini?')) {
                        fetchChildData()
                      }
                    }}
                    variant="outline"
                    className="h-8 px-2 text-sm border-red-500 text-red-500 hover:bg-red-50"
                  >
                    Padam
                  </Button>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-2xl font-bold text-gray-900">
                  RM {asset.amount.toLocaleString('ms-MY', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>

              {asset.category.name === 'Emas' && asset.metadata ? (
                <div className="mt-2 text-sm text-gray-600">
                  <span>{asset.metadata.weight}g</span>
                  {asset.metadata.type && (
                    <span className="ml-1">
                      ({goldTypeMap[asset.metadata.type] || asset.metadata.type})
                    </span>
                  )}
                </div>
              ) : null}

              {asset.note && (
                <div className="mt-2 text-sm text-gray-500">
                  {asset.note}
                </div>
              )}
            </div>
          ))}
        </div>

        {assets.length === 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              Tiada rekod aset. Sila tambah aset baru.
            </p>
          </div>
        )}

        <AddAssetForm
          childId={childId}
          open={isAddAssetOpen}
          onOpenChange={setIsAddAssetOpen}
          onAssetAdded={fetchChildData}
        />

        {editingAsset && (
          <EditAssetDialog
            open={!!editingAsset}
            onOpenChange={(open) => !open && setEditingAsset(null)}
            asset={{
              id: editingAsset.id,
              amount: editingAsset.amount,
              category: editingAsset.category.name,
              child_id: childId,
              metadata: editingAsset.metadata,
              note: editingAsset.note
            }}
            onAssetUpdated={fetchChildData}
          />
        )}
      </div>
    </div>
  )
}