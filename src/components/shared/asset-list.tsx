import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'

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

type AssetListProps = {
  assets: Asset[]
  onAssetDeleted: () => void
  onEditAsset: (asset: Asset) => void
}

const goldTypeMap: { [key: string]: string } = {
  '999': 'Emas 999 (24K)',
  '916': 'Emas 916 (22K)',
  '750': 'Emas 750 (18K)',
  '585': 'Emas 585 (14K)',
}

export function AssetList({ assets, onAssetDeleted, onEditAsset }: AssetListProps) {
  const supabase = createClientComponentClient()

  const handleDelete = async (assetId: string) => {
    if (!confirm('Adakah anda pasti untuk memadam aset ini?')) return

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId)

      if (error) throw error
      onAssetDeleted()
    } catch (error) {
      console.error('Error deleting asset:', error)
      alert('Ralat semasa memadam aset')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Kategori
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                Jumlah (RM)
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Maklumat
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {asset.category.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {asset.amount.toLocaleString('ms-MY', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {asset.category.name === 'Emas' && asset.metadata ? (
                    <div>
                      <span>{asset.metadata.weight}g</span>
                      {asset.metadata.type && (
                        <span className="ml-2">
                          ({goldTypeMap[asset.metadata.type] || asset.metadata.type})
                        </span>
                      )}
                      {asset.note && (
                        <div className="text-gray-500 text-xs mt-1">
                          {asset.note}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {asset.note || '-'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => onEditAsset(asset)}
                      variant="outline"
                      className="p-2 h-auto"
                    >
                      <Edit2 size={16} className="text-blue-500" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(asset.id)}
                      variant="outline"
                      className="p-2 h-auto"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {assets.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm text-gray-500 text-center">
                  Tiada rekod aset. Sila tambah aset baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}