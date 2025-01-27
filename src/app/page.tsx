"use client"
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

          <footer className="mt-16 py-6 relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-pink-50 to-yellow-50 opacity-50"></div>
  
  {/* Animated background */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    <div className="absolute left-1/2 -bottom-8 w-24 h-24 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
  </div>

  <div className="relative flex justify-center">
    <a 
      href="https://github.com/Amniazharan" 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative px-6 py-2 font-medium text-gray-600 transition-all duration-300 rounded-full"
    >
      <div className="absolute inset-0 h-full w-full transform -skew-x-12 bg-gradient-to-r from-blue-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full"></div>
      <span className="relative inline-flex items-center">
        <span className="mr-2">Developed by Amni Azharan</span>
        <svg 
          className="w-4 h-4 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </span>
    </a>
  </div>

  <style jsx>{`
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
    @keyframes blob {
      0% {
        transform: translate(0px, 0px) scale(1);
      }
      33% {
        transform: translate(30px, -50px) scale(1.1);
      }
      66% {
        transform: translate(-20px, 20px) scale(0.9);
      }
      100% {
        transform: translate(0px, 0px) scale(1);
      }
    }
  `}</style>
</footer>
        </div>
      </div>
    </div>
  )
}