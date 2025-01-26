import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-500 mb-6">
            Aset Anak
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl">
            Urus dan pantau aset anak-anak anda dengan mudah. Simpan rekod ASB, SSPN, 
            Tabung Haji, emas dan tunai di satu tempat.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 mb-8">
            <Link
              href="/login"
              className="inline-block bg-yellow-400 text-gray-700 px-8 py-3 rounded-lg font-medium 
                hover:bg-yellow-300 transition-colors"
            >
              Log Masuk
            </Link>
            <Link
              href="/register"
              className="inline-block bg-pink-500 text-white px-8 py-3 
                rounded-lg font-medium hover:bg-pink-400 transition-colors"
            >
              Daftar
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-blue-500 mb-2">Mudah Diurus</h3>
              <p className="text-gray-600">Pantau semua aset anak di satu tempat</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">Selamat</h3>
              <p className="text-gray-600">Data anda dilindungi dengan selamat</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-pink-500 mb-2">Fleksibel</h3>
              <p className="text-gray-600">Tambah kategori aset mengikut keperluan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}