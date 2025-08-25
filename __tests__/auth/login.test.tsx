import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Login from "@/app/auth/login/page"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import jest from "jest" // Declare the jest variable

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock toast
jest.mock("@/components/ui/use-toast", () => ({
  toast: jest.fn(),
}))

describe("Login Page", () => {
  const mockPush = jest.fn()
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    jest.clearAllMocks()
  })

  it("renders the login form", () => {
    render(<Login />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
  })

  it("shows error for invalid credentials", async () => {
    // Mock a failed login response
    jest.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Invalid credentials" }),
      } as Response),
    )

    render(<Login />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    })
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive",
      })
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("redirects to dashboard on successful login", async () => {
    // Mock a successful login response
    jest.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Login successful" }),
      } as Response),
    )

    render(<Login />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
      })
    })
    expect(mockPush).toHaveBeenCalledWith("/dashboard")
  })
})
