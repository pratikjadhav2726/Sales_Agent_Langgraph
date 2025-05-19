export async function GET(req: Request) {
  // Replace with your actual Python backend URL
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8501/api/context"

  try {
    // Get context information from your Python backend
    const response = await fetch(backendUrl)

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error connecting to backend:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to connect to backend service",
        product: "Not selected",
        location: "Not provided",
        propertyType: "Not provided",
        energyUsage: "Not provided",
        relevantDocs: ["Product Information"],
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
