'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { AddAssetForm } from '@/components/forms/add-asset-form'
import { AssetList } from '@/components/shared/asset-list'
import EditAssetDialog from '@/components/dialogs/edit-asset-dialog'

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
  created_at: string
  category: {
    id: string
    name: string
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
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-500">{child.name}</h1>
            <p className="text-gray-600 mt-1">
              Jumlah Aset: RM {totalAssets.toLocaleString('ms-MY', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
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
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <AssetList
          assets={assets}
          onAssetDeleted={fetchChildData}
          onEditAsset={handleEditAsset}
        />

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
              child_id: childId
            }}
            onAssetUpdated={fetchChildData}
          />
        )}
      </div>
    </div>
  )
}