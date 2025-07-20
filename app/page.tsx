"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Mic,
  Link,
  Sun,
  Moon,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Shield,
  ExternalLink,
  Loader2,
  Globe,
  Home,
  MessageSquare,
  BookOpen,
  MoreHorizontal,
  Menu,
  X,
  Zap,
  ZapOff,
} from "lucide-react"

// Add your Gemini API key here
const GEMINI_API_KEY = "AIzaSyDMLM2sdSUYE5Lsrv_XoaMJwXnT2izEuxs"

export default function FakeNewsDetector() {
  const [darkMode, setDarkMode] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [headline, setHeadline] = useState("")
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [results, setResults] = useState(null)

  // Standard mode mock results
  const mockStandardResults = {
    veracity: {
      status: "Mixed",
      confidence: 72,
      color: "bg-yellow-500",
    },
    bias: {
      level: "Slightly Left",
      position: 35,
      color: "bg-blue-400",
    },
    credibility: {
      score: 68,
      explanation: "Source has moderate credibility with some factual inaccuracies",
    },
    summary:
      "This article contains some factual information but includes unverified claims and shows slight political bias. We recommend cross-referencing with additional sources.",
    alternatives: [
      {
        id: 1,
        title: "Fact-checked version of this story",
        source: "Reuters",
        summary: "Independent verification of the main claims",
        image: "/placeholder.svg?height=60&width=60",
        url: "#",
      },
      {
        id: 2,
        title: "Alternative perspective on the topic",
        source: "Associated Press",
        summary: "Comprehensive coverage with multiple viewpoints",
        image: "/placeholder.svg?height=60&width=60",
        url: "#",
      },
      {
        id: 3,
        title: "Expert analysis and context",
        source: "BBC News",
        summary: "In-depth analysis from subject matter experts",
        image: "/placeholder.svg?height=60&width=60",
        url: "#",
      },
    ],
  }

  const navigationItems = [
    { icon: Home, label: "Home", active: true },
    { icon: MessageSquare, label: "Feedback", active: false },
    { icon: BookOpen, label: "Resources Used", active: false },
    { icon: MoreHorizontal, label: "More", active: false },
  ]

  // Gemini API integration
  const analyzeWithGemini = async (headline, url = "") => {
    const prompt = `
    Analyze the following news headline and search the web for fake news detection and provide a structured response:

    Headline: "${headline}"
    ${url ? `URL: ${url}` : ""}

    Please analyze and provide:
    1. Veracity assessment (Real/Fake/Mixed) with confidence percentage
    2. Contextual bias label (e.g. Pro-Government, Anti-Corporate) with position score (0-100 scale for lean/intensity)
    3. Credibility score (0-100) with explanation
    4. Brief summary of your analysis
    5. 3-4 alternative trusted sources that would provide reliable information on this topic


    Format your response as JSON with this structure:
    {
      "veracity": {
        "status": "Real/Fake/Mixed",
        "confidence": number,
        "color": "bg-green-500/bg-red-500/bg-yellow-500"
      },
      "bias": {
        "label": "contextual bias description (e.g. Pro-Government, Anti-Corporate)",
        "position": number (0-100),
        "color": "bg-blue-400"
      },
      "credibility": {
        "score": number,
        "explanation": "detailed explanation"
      },
      "summary": "analysis summary",
      "alternatives": [
        {
          "id": number,
          "title": "article title",
          "source": "source name",
          "summary": "brief description"
          "url": "#"
        }
      ]
    }
    `

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to analyze with Gemini API")
      }

      const data = await response.json()
      const generatedText = data.candidates[0].content.parts[0].text

      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Invalid response format from Gemini")
      }
    } catch (error) {
      console.error("Gemini API Error:", error)
      // Fallback to mock data if API fails
      return {
        veracity: {
          status: "Mixed",
          confidence: 75,
          color: "bg-yellow-500",
        },
        bias: {
          level: "Slightly Left",
          position: 35,
          color: "bg-blue-400",
        },
        credibility: {
          score: 65,
          explanation: "Gemini API analysis unavailable. Please check your API key and try again.",
        },
        summary: "Unable to perform advanced analysis. Using fallback assessment.",
        alternatives: [
          {
            id: 1,
            title: "Fact-check this claim on Snopes",
            source: "Snopes",
            summary: "Independent fact-checking resource",
            image: "/placeholder.svg?height=60&width=60",
            url: "#",
          },
          {
            id: 2,
            title: "Reuters fact-check section",
            source: "Reuters",
            summary: "Professional journalism fact-checking",
            image: "/placeholder.svg?height=60&width=60",
            url: "#",
          },
          {
            id: 3,
            title: "Associated Press fact-check",
            source: "AP News",
            summary: "Comprehensive fact verification",
            image: "/placeholder.svg?height=60&width=60",
            url: "#",
          },
        ],
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!headline.trim()) return

    setIsLoading(true)

    try {
      if (advancedMode) {
        // Use Gemini API for advanced analysis
        const geminiResults = await analyzeWithGemini(headline, url)
        setResults(geminiResults)
      } else {
        // Use mock data for standard mode
        setTimeout(() => {
          setResults(mockStandardResults)
          setIsLoading(false)
          setShowResults(true)
        }, 2000)
        return
      }
    } catch (error) {
      console.error("Analysis error:", error)
      // Fallback to mock data
      setResults(mockStandardResults)
    }

    setIsLoading(false)
    setShowResults(true)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const toggleAdvancedMode = () => {
    setAdvancedMode(!advancedMode)
    // Reset results when switching modes
    setShowResults(false)
    setResults(null)
  }

  const getVeracityIcon = (status) => {
    switch (status) {
      case "Real":
      case "Likely True":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case "Fake":
      case "Likely False":
        return <XCircle className="w-6 h-6 text-red-500" />
      case "Mixed":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />
    }
  }

  const CircularProgress = ({ value, size = 120 }) => {
    const circumference = 2 * Math.PI * 45
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className={darkMode ? "text-gray-700" : "text-gray-200"}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${advancedMode ? "text-purple-500" : "text-blue-500"}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{value}%</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-300 font-sans ${darkMode ? "dark" : ""}`}>
      {/* Background Layers */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 ${
            darkMode ? "bg-gradient-to-br from-gray-900 to-black" : "bg-gradient-to-br from-sky-100 to-blue-200"
          }`}
        />

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url('/https://tse2.mm.bing.net/th/id/OIP.9oaKEVaSIl3wBD9ZwH03WgAAAA?pid=Api&P=0&h=180?height=1080&width=1920')`,
          }}
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 z-30 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div
          className={`h-full backdrop-blur-xl border-r ${
            darkMode ? "bg-black/20 border-gray-700/50" : "bg-white/20 border-white/30"
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${darkMode ? "bg-blue-500/20" : "bg-blue-600/20"}`}>
                <Shield className={`w-6 h-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-white"}`}>TruthLens</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  item.active
                    ? darkMode
                      ? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10"
                      : "bg-blue-600/20 text-blue-600 shadow-lg shadow-blue-600/10"
                    : darkMode
                      ? "text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105"
                      : "text-white/80 hover:bg-white/20 hover:text-white hover:scale-105"
                } hover:shadow-lg`}
              >
                <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-64"}`}>
        {/* Header */}
        <header className="relative z-10 p-6">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Button */}
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="icon"
              className="lg:hidden bg-white/10 backdrop-blur-sm hover:bg-white/20 border-0"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </Button>

            {/* Desktop Title */}
            <div className="hidden lg:block">
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-white"}`}>
                News Verification Dashboard
                {advancedMode && (
                  <span className="ml-2 text-sm bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                    Gemini AI Powered
                  </span>
                )}
              </h2>
            </div>

            {/* Toggle Buttons */}
            <div className="flex items-center space-x-2">
              {/* Advanced Mode Toggle */}
              <Button
                onClick={toggleAdvancedMode}
                variant="ghost"
                size="icon"
                className={`bg-white/10 backdrop-blur-sm hover:bg-white/20 border-0 transition-all duration-200 hover:scale-110 ${
                  advancedMode ? "bg-purple-500/20" : ""
                }`}
                title={advancedMode ? "Switch to Standard Mode" : "Switch to Advanced Mode (Gemini AI)"}
              >
                {advancedMode ? (
                  <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
                ) : (
                  <ZapOff className="w-5 h-5 text-gray-400" />
                )}
              </Button>

              {/* Dark Mode Toggle */}
              <Button
                onClick={toggleDarkMode}
                variant="ghost"
                size="icon"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border-0 transition-all duration-200 hover:scale-110"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400 transition-transform duration-200 hover:rotate-12" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-200 transition-transform duration-200 hover:-rotate-12" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6 transition-transform duration-300 hover:scale-110">
                <Globe className={`w-10 h-10 ${darkMode ? "text-blue-400" : "text-blue-600"} animate-pulse`} />
              </div>
              <h2 className={`text-5xl font-bold mb-4 ${darkMode ? "text-white" : "text-white"} animate-slide-up`}>
                Fake News Detection & Source Credibility Checker
              </h2>
              <p
                className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-200"} max-w-2xl mx-auto animate-slide-up-delay`}
              >
                {advancedMode
                  ? "Advanced AI-powered analysis with Gemini for enhanced accuracy and deeper insights"
                  : "Verify news authenticity, check source credibility, and discover trusted alternatives"}
              </p>
            </div>

            {/* Mode Indicator */}
            {advancedMode && (
              <div className="mb-6">
                <Badge className="bg-purple-500/20 text-purple-300 px-4 py-2 text-sm border border-purple-500/30">
                  <Zap className="w-4 h-4 mr-2" />
                  Advanced Mode - Powered by Gemini AI
                </Badge>
              </div>
            )}

            {/* Input Section */}
            <Card
              className={`bg-white/10 backdrop-blur-xl border-0 shadow-2xl transition-all duration-300 hover:shadow-3xl animate-slide-up-delay-2 ${
                darkMode ? "bg-black/20 hover:bg-black/25" : "bg-white/20 hover:bg-white/25"
              } ${advancedMode ? "border border-purple-500/30" : ""}`}
            >
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Headline Input */}
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 group-focus-within:text-blue-500">
                      <Search className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                    <Input
                      type="text"
                      placeholder={
                        advancedMode
                          ? "Enter news headline for advanced AI analysis..."
                          : "Enter news headline or claim to verify..."
                      }
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className={`pl-12 pr-12 py-6 text-lg backdrop-blur-sm border-white/30 placeholder:text-gray-400 transition-all duration-200 focus:scale-[1.02] ${
                        darkMode
                          ? "text-white bg-black/20 border-gray-600 focus:border-blue-500"
                          : "text-gray-900 bg-white/30 border-white/40 focus:border-blue-500"
                      } ${advancedMode ? "focus:border-purple-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-white/20 transition-all duration-200 hover:scale-110"
                    >
                      <Mic
                        className={`w-5 h-5 ${darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"}`}
                      />
                    </Button>
                  </div>

                  {/* URL Input */}
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 group-focus-within:text-blue-500">
                      <Link className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                    <Input
                      type="url"
                      placeholder="Or paste article URL (optional)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className={`pl-12 py-4 backdrop-blur-sm border-white/30 placeholder:text-gray-400 transition-all duration-200 focus:scale-[1.02] ${
                        darkMode
                          ? "text-white bg-black/20 border-gray-600 focus:border-blue-500"
                          : "text-gray-900 bg-white/30 border-white/40 focus:border-blue-500"
                      } ${advancedMode ? "focus:border-purple-500" : ""}`}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!headline.trim() || isLoading}
                    className={`w-full py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      advancedMode
                        ? darkMode
                          ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25"
                          : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25"
                        : darkMode
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25"
                    } disabled:opacity-50 disabled:hover:scale-100`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {advancedMode ? "Gemini AI Analyzing..." : "Analyzing..."}
                      </>
                    ) : (
                      <>
                        {advancedMode ? (
                          <Zap className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
                        ) : (
                          <Search className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
                        )}
                        {advancedMode ? "Advanced Analysis" : "Check Now"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Results Section */}
        {showResults && results && (
          <section
            className={`relative z-10 px-6 py-12 transition-all duration-700 transform ${
              showResults ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="max-w-6xl mx-auto">
              <h3
                className={`text-3xl font-bold text-center mb-12 ${darkMode ? "text-white" : "text-white"} animate-fade-in`}
              >
                {advancedMode ? "Gemini AI Analysis Results" : "Analysis Results"}
              </h3>

              {/* Main Results Cards */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {/* Veracity Status */}
                <Card
                  className={`backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-up ${
                    darkMode ? "bg-black/20 hover:bg-black/30" : "bg-white/20 hover:bg-white/30"
                  } ${advancedMode ? "border border-purple-500/20" : ""}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 transition-transform duration-200 hover:scale-110">
                      {getVeracityIcon(results.veracity.status)}
                    </div>
                    <h4 className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Veracity Status
                    </h4>
                    <Badge
                      className={`${results.veracity.color} text-white px-4 py-2 text-lg mb-2 transition-transform duration-200 hover:scale-105`}
                    >
                      {results.veracity.status}
                    </Badge>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {results.veracity.confidence}% confidence
                    </p>
                  </CardContent>
                </Card>

                {/* Bias Level */}
                <Card
                  className={`backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-up-delay ${
                    darkMode ? "bg-black/20 hover:bg-black/30" : "bg-white/20 hover:bg-white/30"
                  } ${advancedMode ? "border border-purple-500/20" : ""}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <TrendingUp
                        className={`w-6 h-6 mx-auto transition-transform duration-200 hover:scale-110 ${
                          advancedMode
                            ? darkMode
                              ? "text-purple-400"
                              : "text-purple-600"
                            : darkMode
                              ? "text-blue-400"
                              : "text-blue-600"
                        }`}
                      />
                    </div>
                    <h4 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Political Bias
                    </h4>
                    <div className="space-y-3">
                      <div
                        className={`w-full bg-gray-200 rounded-full h-3 ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}
                      >
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ease-out relative ${
                            advancedMode ? "bg-purple-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${results.bias.position}%` }}
                        >
                          <div
                            className={`absolute right-0 top-0 w-3 h-3 rounded-full animate-pulse ${
                              advancedMode ? "bg-purple-600" : "bg-blue-600"
                            }`}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Left</span>
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Center</span>
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Right</span>
                      </div>
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{results.bias.level}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Credibility Score */}
                <Card
                  className={`backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-up-delay-2 ${
                    darkMode ? "bg-black/20 hover:bg-black/30" : "bg-white/20 hover:bg-white/30"
                  } ${advancedMode ? "border border-purple-500/20" : ""}`}
                >
                  <CardContent className="p-6 text-center">
                    <h4 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Credibility Score
                    </h4>
                    <div className="flex justify-center mb-4">
                      <CircularProgress value={results.credibility.score} />
                    </div>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {results.credibility.explanation}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <Card
                className={`backdrop-blur-xl border-0 shadow-xl mb-12 animate-fade-in-delay ${
                  darkMode ? "bg-black/20" : "bg-white/20"
                } ${advancedMode ? "border border-purple-500/20" : ""}`}
              >
                <CardContent className="p-8">
                  <h4 className={`text-2xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {advancedMode ? "Gemini AI Analysis Summary" : "Analysis Summary"}
                  </h4>
                  <p className={`text-lg leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {results.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Trusted Alternatives */}
              <div className="animate-slide-up-delay-3">
                <h4 className={`text-2xl font-semibold mb-8 ${darkMode ? "text-white" : "text-white"}`}>
                  {advancedMode ? "AI-Curated Alternative Sources" : "Trusted Alternative Sources"}
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  {results.alternatives.map((article, index) => (
                    <Card
                      key={article.id}
                      className={`backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
                        darkMode ? "bg-black/20 hover:bg-black/30" : "bg-white/20 hover:bg-white/30"
                      } ${advancedMode ? "border border-purple-500/20" : ""}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="flex-1">
                            <h5 className={`font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {article.title}
                            </h5>
                            <p
                              className={`text-sm ${
                                advancedMode
                                  ? darkMode
                                    ? "text-purple-400"
                                    : "text-purple-600"
                                  : darkMode
                                    ? "text-blue-400"
                                    : "text-blue-600"
                              }`}
                            >
                              {article.source}
                            </p>
                          </div>
                        </div>
                        <p className={`text-sm mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {article.summary}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`w-full transition-all duration-200 hover:scale-105 group ${
                            advancedMode
                              ? darkMode
                                ? "border-purple-600 text-white hover:bg-purple-500/10 hover:border-purple-400"
                                : "border-purple-500 text-gray-700 hover:bg-purple-500/10 hover:border-purple-500"
                              : darkMode
                                ? "border-gray-600 text-white hover:bg-white/10 hover:border-blue-400"
                                : "border-gray-300 text-gray-700 hover:bg-white/20 hover:border-blue-500"
                          }`}
                        >
                          Read More
                          <ExternalLink className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:scale-110" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
