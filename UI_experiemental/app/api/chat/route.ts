export async function POST(req: Request) {
  const { message, user_id } = await req.json()

  // Replace with your actual Python backend URL
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000/api/chat"

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, user_id }),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error connecting to backend:", error)
    return Response.json(
      {
        reply: "Sorry, I'm having trouble connecting to the backend service.",
        needs_human: false,
      },
      { status: 200 },
    )
  }
}
