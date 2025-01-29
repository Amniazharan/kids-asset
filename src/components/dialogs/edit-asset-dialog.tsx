import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type EditAssetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: {
    id: string;
    amount: number;
    category: string;
    child_id: string;
    note?: string | null;
    metadata?: {
      weight?: number;
      type?: string;
    } | null;
  };
  onAssetUpdated: () => void;
};

const goldTypes = [
  { id: '999', name: 'Emas 999 (24K)' },
  { id: '916', name: 'Emas 916 (22K)' },
  { id: '750', name: 'Emas 750 (18K)' },
  { id: '585', name: 'Emas 585 (14K)' },
];

export default function EditAssetDialog({ 
  open, 
  onOpenChange, 
  asset, 
  onAssetUpdated 
}: EditAssetDialogProps) {
  const [amount, setAmount] = useState(asset.amount.toString());
  const [weight, setWeight] = useState(asset.metadata?.weight?.toString() || '');
  const [goldType, setGoldType] = useState(asset.metadata?.type || '999');
  const [note, setNote] = useState(asset.note || '');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    setAmount(asset.amount.toString());
    setWeight(asset.metadata?.weight?.toString() || '');
    setGoldType(asset.metadata?.type || '999');
    setNote(asset.note || '');
  }, [asset]);

  const isGoldCategory = asset.category === 'Emas';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updating) return;

    if (isGoldCategory && !weight) {
      setError('Sila isi berat emas');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const updateData = {
        amount: parseFloat(amount),
        note: note.trim() || null
      };

      if (isGoldCategory) {
        Object.assign(updateData, {
          metadata: {
            weight: parseFloat(weight),
            type: goldType
          }
        });
      }

      console.log('Updating asset with data:', { 
        assetId: asset.id, 
        updateData 
      });

      const { data, error: updateError } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', asset.id)
        .select();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      console.log('Update successful:', data);

      onOpenChange(false);
      onAssetUpdated();
    } catch (error: any) {
      console.error('Error updating asset:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      setError(error.message || 'Ralat semasa mengemaskini aset');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kemaskini {asset.category}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah (RM)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={updating}
              className="text-right"
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
                  disabled={updating}
                  className="text-right"
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
                  disabled={updating}
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
              disabled={updating}
            />
          </div>

          <Button 
            type="submit"
            disabled={updating}
            className="w-full bg-blue-500 hover:bg-blue-400"
          >
            {updating ? 'Sedang kemaskini...' : 'Kemaskini'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}