'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'

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

interface AssetListProps {
  assets: Asset[]
  onAssetDeleted: () => void
}

export function AssetList({ assets, onAssetDeleted }: AssetListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const supabase = createClientComponentClient()

  const handleDelete = async (assetId: string) => {
    if (deletingId) return
    
    if (!confirm('Adakah anda pasti untuk memadam aset ini?')) return

    setDeletingId(assetId)
    setError('')

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId)

      if (error) throw error
      onAssetDeleted()
    } catch (error) {
      console.error('Error deleting asset:', error)
      setError('Ralat semasa memadam aset')
    } finally {
      setDeletingId(null)
    }
  }

  if (assets.length === 0) {
    return (
      <p className="text-center text-gray-500 my-8">
        Tiada aset. Sila tambah aset baru.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-medium text-gray-900">
                {asset.category.name}
              </div>
              <div className="text-sm text-gray-500">
                RM {asset.amount.toLocaleString('ms-MY', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              {asset.note && (
                <div className="text-sm text-gray-500">
                  {asset.note}
                </div>
              )}
            </div>
            <Button
              onClick={() => handleDelete(asset.id)}
              disabled={deletingId === asset.id}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              {deletingId === asset.id ? 'Memadam...' : 'Padam'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}