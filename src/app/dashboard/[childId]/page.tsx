'use client'

import { useParams } from 'next/navigation'
import ChildProfile from '../../../components/child-profile'

export default function ChildPage() {
  const params = useParams()
  const childId = params?.childId as string
  
  if (!childId) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600">ID anak tidak sah</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <ChildProfile childId={childId} />
      </div>
    </div>
  )
}