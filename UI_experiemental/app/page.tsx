"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, MessageSquare, Sun, Database, Clock, User, Edit } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

export default function SalesAgentDashboard() {
  // State for messages and UI
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string; id: string; needsApproval?: boolean }>
  >([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState<{ id: string; content: string }[]>([])
  const [activeTab, setActiveTab] = useState("chat")
  const [editedReply, setEditedReply] = useState("")
  const [userId, setUserId] = useState("")

  // Get initial messages and user ID on load
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const response = await fetch("/api/init")
        const data = await response.json()

        if (data.messages && data.messages.length > 0) {
          // Convert Streamlit format to our format
          const formattedMessages = data.messages.map((msg: [string, string], index: number) => ({
            role: msg[0] === "You" ? "user" : "assistant",
            content: msg[1],
            id: `msg-${index}`,
            needsApproval: msg[1] === "🤖 Awaiting human approval...",
          }))

          setMessages(formattedMessages)

          // Add to pending approvals if needed
          const approvals = formattedMessages.filter((msg) => msg.needsApproval)
          if (approvals.length > 0) {
            setPendingApprovals(
              approvals.map((msg) => ({
                id: msg.id,
                content: msg.content,
              })),
            )
          }
        }

        if (data.user_id) {
          setUserId(data.user_id)
        }
      } catch (error) {
        console.error("Failed to fetch initial state:", error)
        // Add default welcome message
        setMessages([
          {
            role: "assistant",
            content: "Hello, I am your SolarSmart assistant. Do you need any help with our solar panels or services?",
            id: "default-welcome",
          },
        ])
      }
    }

    fetchInitialState()
  }, [])

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    // Add user message immediately
    const userMessage = {
      role: "user",
      content: input,
      id: `user-${Date.now()}`,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send to backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          user_id: userId,
        }),
      })

      const data = await response.json()

      // Add assistant response
      const assistantMessage = {
        role: "assistant",
        content: data.needs_human ? "🤖 Awaiting human approval..." : data.reply,
        id: `assistant-${Date.now()}`,
        needsApproval: data.needs_human,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Add to pending approvals if needed
      if (data.needs_human) {
        setPendingApprovals((prev) => [
          ...prev,
          {
            id: assistantMessage.id,
            content: data.reply, // Store the actual reply for editing
          },
        ])
      }

      setInput("")
    } catch (error) {
      console.error("Error sending message:", error)
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
          id: `error-${Date.now()}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle approving a message
  const handleApprove = async (id: string) => {
    try {
      const response = await fetch("/api/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          approve: true,
        }),
      })

      const data = await response.json()

      // Update the message with the approved reply
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, content: data.reply, needsApproval: false } : msg)),
      )

      // Remove from pending approvals
      setPendingApprovals((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error approving message:", error)
    }
  }

  // Handle editing and rejecting a message
  const handleRejectEdit = async (id: string) => {
    if (!editedReply.trim()) return

    try {
      await fetch("/api/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          approve: false,
          edited_reply: editedReply,
        }),
      })

      // Update the message with the edited reply
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, content: editedReply, needsApproval: false } : msg)),
      )

      // Remove from pending approvals
      setPendingApprovals((prev) => prev.filter((item) => item.id !== id))

      setEditedReply("")
    } catch (error) {
      console.error("Error rejecting/editing message:", error)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-slate-800">SolarSmart</h1>
          <p className="text-sm text-slate-500">Sales Assistant</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("chat")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </Button>
          <Button
            variant={activeTab === "approvals" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("approvals")}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approvals
            {pendingApprovals.length > 0 && (
              <Badge className="ml-auto" variant="destructive">
                {pendingApprovals.length}
              </Badge>
            )}
          </Button>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Sales Agent</p>
              <p className="text-xs text-slate-500">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              {activeTab === "chat" ? "Customer Conversation" : "Pending Approvals"}
            </h2>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center">
                <Database className="mr-1 h-3 w-3" />
                RAG Enabled
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                Memory Active
              </Badge>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} className="flex-1 flex flex-col">
          <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Sun className="h-12 w-12 text-yellow-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">SolarSmart Sales Assistant</h3>
                  <p className="text-slate-500 max-w-md">
                    I can help answer questions about SolarSmart products, pricing, and installation options.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-start max-w-[80%]">
                        {message.role !== "user" && (
                          <Avatar className="mr-2 mt-0.5">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                            <AvatarFallback>SA</AvatarFallback>
                          </Avatar>
                        )}

                        <Card
                          className={`${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-white"}`}
                        >
                          <CardContent className="p-3">
                            <div className="text-sm">{message.content}</div>
                            {message.needsApproval && (
                              <div className="mt-2 flex items-center text-xs text-amber-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pending approval
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {message.role === "user" && (
                          <Avatar className="ml-2 mt-0.5">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about SolarSmart products..."
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Thinking..." : "Send"}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="flex-1 p-4 m-0">
            {pendingApprovals.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Pending Approvals</h3>
                <p className="text-slate-500 max-w-md">All pricing and contract information has been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-slate-500">
                  {pendingApprovals.length} item{pendingApprovals.length !== 1 ? "s" : ""} requiring approval
                </h3>

                {pendingApprovals.map((item) => (
                  <Card key={item.id} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">Response Requires Approval</p>
                          <div className="mb-3">
                            <Textarea
                              placeholder="Edit the assistant's reply..."
                              className="w-full mb-2"
                              value={editedReply}
                              onChange={(e) => setEditedReply(e.target.value)}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectEdit(item.id)}
                              disabled={!editedReply.trim()}
                              className="flex items-center"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit & Send
                            </Button>
                            <Button size="sm" onClick={() => handleApprove(item.id)} className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Context Panel */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col">
        <h3 className="font-semibold text-slate-800 mb-4">Quick Info</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Current Promotions</h4>
            <Card className="bg-slate-50">
              <CardContent className="p-3">
                <p className="text-sm font-medium">20% off on solar panels!</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">FAQs</h4>
            <Card className="bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <CardContent className="p-3">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Click here
                </a>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Contact Us</h4>
            <Card className="bg-slate-50">
              <CardContent className="p-3">
                <p className="text-sm">1-800-SOLAR</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
