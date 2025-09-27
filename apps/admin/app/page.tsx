export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          KhaledAun.com Admin
        </h1>
        <p className="text-gray-600">
          Admin dashboard is running successfully!
        </p>
        <div className="mt-8 space-x-4">
          <a 
            href="/admin/command-center" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Command Center
          </a>
          <a 
            href="/en/contact" 
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Contact Page
          </a>
        </div>
      </div>
    </div>
  );
}
