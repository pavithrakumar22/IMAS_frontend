import { SignUp } from "@clerk/nextjs"
import { Stethoscope, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                IMAS
              </span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Welcome Message */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join IMAS</h2>
            <p className="text-gray-600 mb-8">
              Create your account to start using AI-powered medical guidance for rural healthcare
            </p>
          </div>

          {/* Clerk Sign Up Component */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-sm normal-case",
                  card: "shadow-none",
                  headerTitle: "text-2xl font-bold text-gray-900",
                  headerSubtitle: "text-gray-600",
                  socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50",
                  socialButtonsBlockButtonText: "text-gray-700",
                  formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                  footerActionLink: "text-blue-600 hover:text-blue-700",
                },
              }}
              redirectUrl="/dashboard"
              signInUrl="/sign-in"
            />
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why join IMAS?</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Multi-language Support</p>
                  <p className="text-xs text-gray-600">
                    Get medical guidance in Telugu, Hindi, and other local languages
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">AI-Powered Diagnosis</p>
                  <p className="text-xs text-gray-600">Advanced AI agents for accurate medical recommendations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Expert Network</p>
                  <p className="text-xs text-gray-600">Access to medical knowledge bases and specialist consultation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Privacy & Security</p>
                  <p className="text-xs text-gray-600">HIPAA-compliant with end-to-end encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2024 IMAS. Empowering rural healthcare with AI.</p>
        </div>
      </footer>
    </div>
  )
}
