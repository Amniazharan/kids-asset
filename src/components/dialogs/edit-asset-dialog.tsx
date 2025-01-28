import React, { useState } from 'react';
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
  };
  onAssetUpdated: () => void;
};

export default function EditAssetDialog({ 
  open, 
  onOpenChange, 
  asset, 
  onAssetUpdated 
}: EditAssetDialogProps) {
  const [amount, setAmount] = useState(asset.amount.toString());
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updating) return;

    setUpdating(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('assets')
        .update({ 
          amount: parseFloat(amount),
          updated_at: new Date().toISOString()
        })
        .eq('id', asset.id);

      if (updateError) throw updateError;

      onOpenChange(false);
      onAssetUpdated();
    } catch (error: any) {
      console.error('Error updating asset:', error);
      setError('Ralat semasa mengemaskini aset');
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