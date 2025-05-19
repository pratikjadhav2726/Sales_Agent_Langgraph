export async function GET() {
  // Replace with your actual Python backend URL
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000/api/init"

  try {
    const response = await fetch(backendUrl)

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error connecting to backend:", error)
    return Response.json(
      {
        user_id: `user-${Date.now()}`,
        messages: [
          [
            "Assistant",
            "Hello, I am your SolarSmart assistant. Do you need any help with our solar panels or services?",
          ],
        ],
      },
      { status: 200 },
    )
  }
}
