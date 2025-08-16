"use client"

import { useState } from "react"
import { Sparkles, TrendingUp, Lightbulb, RefreshCw, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import GoogleAIService, { type MarketInsight } from "@/lib/google-ai"

interface AISuggestionsProps {
  type: "nft" | "tokenization" | "market"
  context?: any
  onApplySuggestion?: (suggestion: any) => void
}

export function AISuggestions({ type, context, onApplySuggestion }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const aiService = GoogleAIService.getInstance()

  const generateSuggestions = async () => {
    setLoading(true)
    try {
      if (type === "nft") {
        const nftSuggestions = await aiService.generateNFTSuggestions(context?.file, context?.userInput)
        setSuggestions(nftSuggestions)
      } else if (type === "tokenization") {
        const tokenSuggestions = await aiService.generateTokenizationSuggestions(context)
        setSuggestions(tokenSuggestions)
      } else if (type === "market") {
        const marketInsights = await aiService.getMarketInsights(context?.blockchain || "ethereum")
        setInsights(marketInsights)
      }
    } catch (error) {
      console.error("[v0] AI suggestion error:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const applySuggestion = (suggestion: any) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Suggestions</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={generateSuggestions} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
            {loading ? "Generating..." : "Get Suggestions"}
          </Button>
        </div>
        <CardDescription>
          AI-powered recommendations to optimize your{" "}
          {type === "nft" ? "NFT creation" : type === "tokenization" ? "tokenization strategy" : "market approach"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {type === "market" && insights.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Market Insights
            </h4>
            {insights.map((insight, index) => (
              <Alert key={index}>
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{insight.trend}</p>
                      <p className="text-sm text-muted-foreground mt-1">{insight.recommendation}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary">{insight.confidence}% confidence</Badge>
                        <Badge variant="outline">{insight.timeframe}</Badge>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {(type === "nft" || type === "tokenization") && suggestions.length > 0 && (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  {type === "nft" && (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{suggestion.name}</h4>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(suggestion.name, index)}>
                            {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => applySuggestion(suggestion)}>
                            Apply
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.tags.map((tag: string, tagIndex: number) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          Collection: <strong>{suggestion.collection}</strong>
                        </span>
                        <Badge className="capitalize">{suggestion.blockchain}</Badge>
                      </div>
                      <Alert>
                        <AlertDescription className="text-xs">
                          <strong>AI Reasoning:</strong> {suggestion.reasoning}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {type === "tokenization" && (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{suggestion.tokenName}</h4>
                        <Button variant="outline" size="sm" onClick={() => applySuggestion(suggestion)}>
                          Apply
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Symbol:</span>
                          <p className="font-medium">{suggestion.tokenSymbol}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Supply:</span>
                          <p className="font-medium">{suggestion.totalSupply.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Initial Liquidity:</span>
                          <p className="font-medium">{suggestion.initialLiquidity}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lock Period:</span>
                          <p className="font-medium">{suggestion.lockPeriod} days</p>
                        </div>
                      </div>
                      <Alert>
                        <AlertDescription className="text-xs">
                          <strong>AI Reasoning:</strong> {suggestion.reasoning}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {suggestions.length === 0 && insights.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Get Suggestions" to receive AI-powered recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
