import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Languages,
  Brain,
  Network,
  Stethoscope,
  MessageSquare,
  Users,
  MapPin,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import { currentUser } from "@clerk/nextjs/server"
import Link from "next/link"

export default async function HomePage() {
  // Get the current user to handle authentication state
  const user = await currentUser()

  const agents = [
    {
      icon: Languages,
      title: "Translation Agent",
      description:
        "Converts patient queries from local languages (Telugu, Hindi) into processing language using fine-tuned SeamlessM4T model",
      color: "bg-blue-500",
    },
    {
      icon: Brain,
      title: "Medical Complexity Assessment",
      description: "Categorizes cases into low, medium, or high complexity, triggering escalation for high-risk cases",
      color: "bg-green-500",
    },
    {
      icon: Network,
      title: "Expert Network Integration",
      description: "Aggregates reasoning from multiple LLMs and medical knowledge bases (PubMedQA, MedQA)",
      color: "bg-purple-500",
    },
    {
      icon: Stethoscope,
      title: "Final Advice Generation",
      description:
        "Leverages Llama3 70B or GPT4, fine-tuned on medical benchmarks for accurate clinical recommendations",
      color: "bg-red-500",
    },
    {
      icon: MessageSquare,
      title: "Response Simplification",
      description: "Converts technical advice into clear, culturally sensitive guidance with privacy guardrails",
      color: "bg-orange-500",
    },
  ]

  const features = [
    "Context-aware medical guidance",
    "Multi-language support",
    "Triaged case management",
    "Privacy-first approach",
    "Cultural sensitivity",
    "Specialist escalation",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                IMAS
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {!user ? (
                <Link href="/sign-in">
                  <Button variant="outline">Sign In</Button>
                </Link>
              ) : (
                <UserButton />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
              Intelligent Medical Assistant System
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Empowering Rural Healthcare with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                AI Agents
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              IMAS is an agentic AI system designed to support semi-trained rural healthcare providers by offering
              context-aware, triaged, and appropriate medical guidance in local languages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  Access Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Health Workers</h3>
              <p className="text-gray-600">Supporting semi-trained healthcare providers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Rural Areas</h3>
              <p className="text-gray-600">Improving healthcare access in underserved regions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Privacy First</h3>
              <p className="text-gray-600">Secure, culturally sensitive medical guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Pipeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Five AI Agents Working Together</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intelligent pipeline processes medical queries through specialized AI agents, ensuring accurate,
              culturally appropriate healthcare guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 ${agent.color} rounded-lg flex items-center justify-center mb-4`}>
                    <agent.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{agent.title}</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    Agent {index + 1}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">{agent.description}</CardDescription>
                </CardContent>
                {index < agents.length - 1 && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 lg:hidden">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Bridging the Healthcare Gap</h2>
              <p className="text-lg text-gray-600 mb-8">
                IMAS addresses the critical shortage of healthcare professionals in rural areas by empowering local
                healthcare workers with AI-driven medical guidance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Patient Query (Local Language)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">AI Processing Pipeline</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Expert Knowledge Integration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Culturally Appropriate Response</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Rural Healthcare?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join IMAS and help bridge the healthcare gap in underserved communities with the power of AI-driven medical
            guidance.
          </p>
          {!user ? (
            <Link href="/sign-in">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Your Journey <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Access Platform <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">IMAS</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">© 2024 IMAS. Empowering rural healthcare with AI.</p>
          </div>
        </div>
      </footer>
  )
}
