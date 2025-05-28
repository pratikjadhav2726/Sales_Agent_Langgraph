## Experimental UI and Backend Setup

This section describes how to run the experimental Next.js UI and the standalone FastAPI backend.

### Prerequisites

*   **Python:** Required for the FastAPI backend. Ensure Python 3.8+ is installed.
*   **Node.js:** Required for the Next.js frontend. Ensure Node.js (LTS version recommended) and pnpm are installed.
*   **Environment Variables:**
    *   `GROQ_API_KEY`: This API key is required for the agent's language model to function. Set this environment variable in your shell or a `.env` file at the project root.
        ```bash
        export GROQ_API_KEY="your_groq_api_key_here"
        ```

### Backend (FastAPI)

The backend is a FastAPI application that serves as the API bridge.

1.  **Install Python Dependencies:**
    Navigate to the project root directory (where `requirements.txt` is located) and install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
    *Note: Ensure `fastapi` and `uvicorn[standard]` are included in your `requirements.txt` file.*

2.  **Start the FastAPI Server:**
    From the project root directory, run the following command to start the Uvicorn server for the FastAPI application:
    ```bash
    uvicorn UI_experiemental.app.api-bridge:app --host 0.0.0.0 --port 8000 --reload
    ```
    The backend API will now be available at `http://localhost:8000`. The `--reload` flag enables auto-reloading for development.

### Frontend (Next.js)

The frontend is a Next.js application located in the `UI_experiemental` directory.

1.  **Navigate to the UI Directory:**
    ```bash
    cd UI_experiemental
    ```

2.  **Install Node.js Dependencies:**
    This project uses `pnpm` for package management. Install the dependencies:
    ```bash
    pnpm install
    ```

3.  **Start the Next.js Development Server:**
    Once dependencies are installed, start the Next.js development server:
    ```bash
    pnpm run dev
    ```
    The frontend application will typically be available at `http://localhost:3000`.

After completing these steps, you should have the backend API running on port 8000 and the frontend UI running on port 3000, allowing you to interact with the SolarSmart sales assistant.
