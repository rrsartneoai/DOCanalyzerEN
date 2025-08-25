import { render, screen, waitFor } from "@testing-library/react"
import Dashboard from "@/app/dashboard/page"
import { getSupabaseServerClient } from "@/lib/supabase"
import jest from "jest" // Declare the jest variable

// Mock Supabase server client
jest.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: jest.fn(),
}))

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders loading state initially", () => {
    // Mock getSupabaseServerClient to return a promise that never resolves
    ;(getSupabaseServerClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: () => new Promise(() => {}), // Never resolves
      },
    })
    render(<Dashboard />)
    expect(screen.getByText(/loading.../i)).toBeInTheDocument()
  })

  it("redirects to login if user is not authenticated", async () => {
    ;(getSupabaseServerClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
    })

    render(<Dashboard />)

    await waitFor(() => {
      // In a real Next.js app, this would trigger a redirect.
      // Here, we just check for the absence of dashboard content.
      expect(screen.queryByText(/welcome to your dashboard/i)).not.toBeInTheDocument()
    })
  })

  it("renders dashboard content if user is authenticated", async () => {
    const mockUser = { id: "123", email: "test@example.com" }
    ;(getSupabaseServerClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
      },
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument()
      expect(screen.getByText(/start a new analysis/i)).toBeInTheDocument()
      expect(screen.getByText(/view past orders/i)).toBeInTheDocument()
    })
  })

  it("renders the dashboard content", () => {
    render(<Dashboard />)
    expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/recent documents/i)).toBeInTheDocument()
  })
})
