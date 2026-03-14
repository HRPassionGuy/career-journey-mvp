'use client'

export default function NetworkingModulePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Networking Mastery
          </h1>
          
          <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Learn How to Network Like a Pro
            </h2>
            <p className="text-gray-700">
              Watch this comprehensive training on building powerful professional networks 
              that accelerate your career growth.
            </p>
          </div>

          <div className="aspect-w-16 aspect-h-9 mb-8">
            <iframe
              src="https://www.youtube.com/embed/eKVUIAP9rnM"
              title="Networking Mastery Training"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-[500px] rounded-lg"
            ></iframe>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3">Key Takeaways:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✅ How to build authentic professional relationships</li>
              <li>✅ Strategies for expanding your network strategically</li>
              <li>✅ Leveraging connections for career opportunities</li>
              <li>✅ Following up effectively and staying top-of-mind</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
