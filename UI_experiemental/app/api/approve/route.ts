export async function POST(req: Request) {
  const { user_id, approve, edited_reply } = await req.json()

  // Replace with your actual Python backend URL
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000/api/approve"

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id, approve, edited_reply }),
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
        reply: edited_reply || "Approved response",
      },
      { status: 200 },
    )
  }
}
