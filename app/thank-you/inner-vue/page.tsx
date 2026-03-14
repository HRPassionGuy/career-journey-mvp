'use client'

export default function InnerVueThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Inner Vue!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your purchase! Complete the intake form below to get started.
          </p>

          <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Next Steps:</h2>
            <ol className="space-y-2 text-gray-700">
              <li>1. Complete the intake form below</li>
              <li>2. Check your email for the form link and course materials</li>
              <li>3. Access your Inner Vue training immediately</li>
            </ol>
          </div>

          <div className="mb-8">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfZwXOXIqu3m3Z8_69v5lYWBSBbGfo7cLnBH4aEfkVfvGFGQQ/viewform?embedded=true"
              width="100%"
              height="1200"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              className="rounded-lg"
            >
              Loading…
            </iframe>
          </div>

          <p className="text-gray-600">
            Need help? Email us at support@hrpassion.com
          </p>
        </div>
      </div>
    </div>
  )
}
