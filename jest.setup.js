// jest.setup.js
import "@testing-library/jest-dom"
import jest from "jest"
import { TextEncoder, TextDecoder } from "util"

// Polyfill for TextEncoder and TextDecoder for Jest environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Supabase client for tests
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(() => ({
        data: { user: { id: "test-user-id", email: "test@example.com" } },
        error: null,
      })),
      signUp: jest.fn(() => ({ data: { user: { id: "test-user-id", email: "test@example.com" } }, error: null })),
      signOut: jest.fn(() => ({ error: null })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      updateUser: jest.fn(() => ({
        data: {
          user: { id: "test-user-id", email: "test@example.com", user_metadata: { display_name: "Updated User" } },
        },
        error: null,
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: "order-123",
              user_id: "test-user-id",
              status: "pending_payment",
              payment_status: "unpaid",
              price: 10.0,
              file_name: null,
              file_url: null,
              analysis_result: null,
            },
            error: null,
          })),
          order: jest.fn(() => ({ data: [], error: null })),
          count: jest.fn(() => ({ count: 0, error: null })),
        })),
        order: jest.fn(() => ({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: "new-order-id",
              user_id: "test-user-id",
              analysis_type: "basic",
              status: "pending_payment",
              payment_status: "unpaid",
              price: 5.0,
            },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: "order-123",
                status: "processing",
                payment_status: "paid",
                file_url: "http://example.com/file.pdf",
              },
              error: null,
            })),
          })),
          then: jest.fn(() => ({ error: null })),
        })),
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: "order-123",
              status: "processing",
              payment_status: "paid",
              file_url: "http://example.com/file.pdf",
            },
            error: null,
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({ error: null })),
        })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => ({ data: { path: "test/file.pdf" }, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: "http://mock-public-url.com/file.pdf" } })),
      })),
    },
  })),
}))

// Mock @supabase/ssr for createServerClient and createBrowserClient
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => ({
        data: {
          session: {
            access_token: "mock-token",
            user: { id: "test-user-id", email: "test@example.com", user_metadata: { display_name: "Test User" } },
          },
        },
        error: null,
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: "order-123",
              user_id: "test-user-id",
              status: "pending_payment",
              payment_status: "unpaid",
              price: 10.0,
              file_name: null,
              file_url: null,
              analysis_result: null,
            },
            error: null,
          })),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(() => ({
                data: [],
                error: null,
              })),
            })),
            single: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
          count: jest.fn(() => ({ count: 0, error: null })),
        })),
        order: jest.fn(() => ({ data: [], error: null })),
      })),
    })),
  })),
  createBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => ({
        data: {
          session: {
            access_token: "mock-token",
            user: { id: "test-user-id", email: "test@example.com", user_metadata: { display_name: "Test User" } },
          },
        },
        error: null,
      })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(() => ({
        data: { user: { id: "test-user-id", email: "test@example.com" } },
        error: null,
      })),
      signUp: jest.fn(() => ({ data: { user: { id: "test-user-id", email: "test@example.com" } }, error: null })),
      signOut: jest.fn(() => ({ error: null })),
      updateUser: jest.fn(() => ({
        data: {
          user: { id: "test-user-id", email: "test@example.com", user_metadata: { display_name: "Updated User" } },
        },
        error: null,
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: "order-123",
              user_id: "test-user-id",
              status: "pending_payment",
              payment_status: "unpaid",
              price: 10.0,
              file_name: null,
              file_url: null,
              analysis_result: null,
            },
            error: null,
          })),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(() => ({
                data: [],
                error: null,
              })),
            })),
            single: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
          count: jest.fn(() => ({ count: 0, error: null })),
        })),
        order: jest.fn(() => ({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: "new-order-id",
              user_id: "test-user-id",
              analysis_type: "basic",
              status: "pending_payment",
              payment_status: "unpaid",
              price: 5.0,
            },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: "order-123",
                status: "processing",
                payment_status: "paid",
                file_url: "http://example.com/file.pdf",
              },
              error: null,
            })),
          })),
          then: jest.fn(() => ({ error: null })),
        })),
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: "order-123",
              status: "processing",
              payment_status: "paid",
              file_url: "http://example.com/file.pdf",
            },
            error: null,
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({ error: null })),
        })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => ({ data: { path: "test/file.pdf" }, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: "http://mock-public-url.com/file.pdf" } })),
      })),
    },
  })),
}))

// Mock next/headers for server components that use headers() or cookies()
jest.mock("next/headers", () => ({
  headers: () => ({
    get: jest.fn((name) => {
      if (name === "cookie") {
        return "mock-cookie=value"
      }
      return null
    }),
  }),
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key"
process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role-key"
process.env.JWT_SECRET = "super-secret-jwt-key-for-testing-only-12345"
process.env.STRIPE_SECRET_KEY = "sk_test_mock_stripe_secret"
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_mock_stripe_publishable"
process.env.STRIPE_WEBHOOK_SECRET = "whsec_mock_webhook_secret"
process.env.OPENAI_API_KEY = "mock-openai-key"
process.env.GEMINI_API_KEY = "mock-gemini-key"

// Mock Stripe
jest.mock("stripe", () => {
  const StripeMock = jest.fn(() => ({
    paymentIntents: {
      create: jest.fn((params) => {
        if (params.amount === 0) {
          return Promise.reject(new Error("Amount must be greater than zero."))
        }
        return Promise.resolve({
          id: "pi_mock_id",
          client_secret: "pi_mock_client_secret",
          amount: params.amount,
          currency: params.currency,
          metadata: params.metadata,
          status: "requires_payment_method",
        })
      }),
    },
    webhooks: {
      constructEvent: jest.fn((body, signature, secret) => {
        if (signature !== "mock-signature" || secret !== process.env.STRIPE_WEBHOOK_SECRET) {
          throw new Error("Invalid signature or secret")
        }
        const event = JSON.parse(body)
        return {
          type: event.type,
          data: { object: event.data.object },
        }
      }),
    },
  }))
  return StripeMock
})

// Mock @stripe/react-stripe-js
jest.mock("@stripe/react-stripe-js", () => ({
  loadStripe: jest.fn(() =>
    Promise.resolve({
      elements: jest.fn(() => ({
        create: jest.fn(() => ({
          mount: jest.fn(),
          unmount: jest.fn(),
          on: jest.fn(),
          off: jest.fn(),
        })),
      })),
      confirmPayment: jest.fn(() =>
        Promise.resolve({
          paymentIntent: {
            id: "pi_mock_confirmed",
            status: "succeeded",
          },
          error: null,
        }),
      ),
    }),
  ),
  Elements: ({ children }) => <div>{children}</div>,
  PaymentElement: () => <div>PaymentElement</div>,
  useStripe: jest.fn(() => ({
    confirmPayment: jest.fn(() =>
      Promise.resolve({
        paymentIntent: {
          id: "pi_mock_confirmed",
          status: "succeeded",
        },
        error: null,
      }),
    ),
  })),
  useElements: jest.fn(() => ({
    getElement: jest.fn(() => ({
      mount: jest.fn(),
      unmount: jest.fn(),
    })),
  })),
}))

// Mock AI SDK
jest.mock("ai", () => ({
  generateText: jest.fn(({ prompt, model }) => {
    let summary = "Mock analysis result."
    if (prompt.includes("financial")) {
      summary = "Mock financial summary: Revenue $1000, Expenses $500, Profit $500."
    } else if (prompt.includes("legal")) {
      summary = "Mock legal summary: Parties A and B, Clause 1.2, Risk: breach of contract."
    }
    return Promise.resolve({ text: summary })
  }),
}))

jest.mock("@ai-sdk/openai", () => ({
  openai: jest.fn((modelName) => `mock-openai-model-${modelName}`),
}))

jest.mock("@ai-sdk/google", () => ({
  google: jest.fn((modelName) => `mock-google-model-${modelName}`),
}))

// Mock window.matchMedia for components that use it (e.g., theme providers)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  // Add other methods as needed by your tests
}))

// Mock next/navigation for client components that use useRouter, usePathname, etc.
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}))

// Mock the `toast` function from shadcn/ui's use-toast hook
jest.mock("@/components/ui/use-toast", () => ({
  toast: jest.fn(),
}))
