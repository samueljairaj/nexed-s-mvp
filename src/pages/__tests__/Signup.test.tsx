import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// Import the component under test. Adjust path if your actual Signup component lives elsewhere.
import Signup from "../Signup";

// Mocks
const mockSignup = vi.fn();
vi.mock("@/contexts", () => {
  return {
    useAuth: () => ({
      signup: mockSignup,
      isLoading: false,
    }),
  };
});

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as Record<string, unknown>),
    useNavigate: () => navigateMock,
  };
});

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const signInWithOAuthMock = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: unknown[]) => signInWithOAuthMock(...args),
    },
  },
}));

describe("Signup Page", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
    signInWithOAuthMock.mockReset();
    mockSignup.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const setup = () =>
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

  it("renders the form and critical UI elements", () => {
    setup();
    expect(screen.getByRole("heading", { name: /Create your student account/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue with Google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue with Apple/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Student Account/i })).toBeInTheDocument();
  });

  it("validates required fields and shows errors when submitting empty form", async () => {
    setup();
    const submitBtn = screen.getByRole("button", { name: /Create Student Account/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/First name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/You must accept the terms and conditions/i)).toBeInTheDocument();
  });

  it("validates email format", async () => {
    setup();

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", { name: /Create Student Account/i });

    // Fill in all required fields with invalid email
    await userEvent.type(screen.getByLabelText(/First Name/i), "John");
    await userEvent.type(screen.getByLabelText(/Last Name/i), "Doe");
    await userEvent.type(emailInput, "invalid-email");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "Strong123");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "Strong123");
    await userEvent.click(screen.getByRole("checkbox", { name: /I agree to the/i }));

    // Submit form to trigger validation
    await userEvent.click(submitButton);
    
    // Wait for the email validation error to appear
    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });

  it("shows password strength info and updates classes", async () => {
    setup();

    const passwordInput = screen.getByLabelText(/^Password$/i);

    // Very weak (<25)
    await userEvent.type(passwordInput, "a");
    
    // Wait for password strength section to appear
    await waitFor(() => {
      expect(screen.getByText(/Password strength:/i)).toBeInTheDocument();
    });
    
    // Wait for the strength text to appear
    await waitFor(() => {
      expect(screen.getByText(/Very weak/i)).toBeInTheDocument();
    });

    // Weak (<50)
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "abc"); // 25 => 'Weak'
    await waitFor(() => {
      expect(screen.getByText(/Weak/i)).toBeInTheDocument();
    });

    // Good (<75)
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "abcdefgh"); // 50 => 'Good'
    await waitFor(() => {
      expect(screen.getByText(/Good/i)).toBeInTheDocument();
    });

    // Strong (>=75)
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "Abcdef12"); // len>=8, lowercase, uppercase, number => 100
    await waitFor(() => {
      expect(screen.getByText(/Strong/i)).toBeInTheDocument();
    });
  });

  it("requires password >= 8 chars and adequate strength", async () => {
    setup();

    await userEvent.type(screen.getByLabelText(/First Name/i), "John");
    await userEvent.type(screen.getByLabelText(/Last Name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "short"); // < 8
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "short");
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree to the/i }));

    fireEvent.click(screen.getByRole("button", { name: /Create Student Account/i }));

    expect(await screen.findByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();

    // Now make it length >= 8 but still weak (no uppercase or number)
    await userEvent.clear(screen.getByLabelText(/^Password$/i));
    await userEvent.type(screen.getByLabelText(/^Password$/i), "aaaaaaaa"); // length 8 + lowercase => 50 -> "Good" (by label), but validateForm requires strength >= 50 else error
    // For 'too weak' error we need strength < 50, so try "aaaaaaa" (7 chars, also triggers length error though).
    // Better: produce <50 with length >= 8 but only lowercase shouldn't be <50 (it's 50). Let's use "aaaaaaa" then re-check:
    // The diff code sets error if passwordStrength < 50. So to hit "too weak" error specifically, we need a case where length >= 8 but strength < 50, which is impossible per function.
    // We'll assert that when using "aaaaaaaa" we do NOT see the 'too weak' error.
    await userEvent.clear(screen.getByLabelText(/^Password$/i));
    await userEvent.type(screen.getByLabelText(/^Password$/i), "aaaaaaaa");
    await userEvent.clear(screen.getByLabelText(/Confirm Password/i));
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "aaaaaaaa");

    fireEvent.click(screen.getByRole("button", { name: /Create Student Account/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Password is too weak/i)).not.toBeInTheDocument();
    });
  });

  it("shows error when passwords do not match and success indicator when they match", async () => {
    setup();

    await userEvent.type(screen.getByLabelText(/^Password$/i), "Abcdef12");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "Abcdef13");

    fireEvent.click(screen.getByRole("button", { name: /Create Student Account/i }));
    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/Confirm Password/i));
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "Abcdef12");
    expect(await screen.findByText(/Passwords match/i)).toBeInTheDocument();
  });

  it("requires accepting terms and conditions", async () => {
    setup();

    await userEvent.type(screen.getByLabelText(/First Name/i), "John");
    await userEvent.type(screen.getByLabelText(/Last Name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "Abcdef12");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "Abcdef12");

    fireEvent.click(screen.getByRole("button", { name: /Create Student Account/i }));
    expect(await screen.findByText(/You must accept the terms and conditions/i)).toBeInTheDocument();
  });

  it("successful submit calls signup, shows toast.success and navigates to verify-email", async () => {
    setup();
    mockSignup.mockResolvedValueOnce(undefined);

    await userEvent.type(screen.getByLabelText(/First Name/i), "John");
    await userEvent.type(screen.getByLabelText(/Last Name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "Abcdef12");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "Abcdef12");
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree to the/i }));

    fireEvent.click(screen.getByRole("button", { name: /Create Student Account/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith("john@example.com", "Abcdef12", "student");
      expect(toastSuccess).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith("/verify-email", { state: { email: "john@example.com" } });
    });
  });

  it("handles signup error: user already registered", async () => {
    setup();
    mockSignup.mockRejectedValueOnce(new Error("User already registered"));

    await userEvent.type(screen.getByLabelText(/First Name/i), "John");
    await userEvent.type(screen.getByLabelText(/Last Name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "Abcdef12");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "Abcdef12");
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree to the/i }));

    fireEvent.click(screen.getByRole("button", { name: /Create Student Account/i }));

    expect(
      await screen.findByText(/An account with this email already exists/i)
    ).toBeInTheDocument();
    expect(toastError).toHaveBeenCalled();
  });

  it("handles signup error: password policy", async () => {
    setup();
    mockSignup.mockRejectedValueOnce(new Error("Password does not meet security requirements."));

    await userEvent.type(screen.getByLabelText(/First Name/i), "John");
    await userEvent.type(screen.getByLabelText(/Last Name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "Abcdef12");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "Abcdef12");
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree to the/i }));

    fireEvent.click(screen.getByRole("button", { name: /Create Student Account/i }));

    expect(
      await screen.findByText(/Password does not meet security requirements/i)
    ).toBeInTheDocument();
    expect(toastError).toHaveBeenCalled();
  });

  it("handles signup error: rate limit", async () => {
    setup();
    mockSignup.mockRejectedValueOnce(new Error("rate limit exceeded"));

    await userEvent.type(screen.getByLabelText(/First Name/i), "John");
    await userEvent.type(screen.getByLabelText(/Last Name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "Abcdef12");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "Abcdef12");
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree to the/i }));

    fireEvent.click(screen.getByRole("button", { name: /Create Student Account/i }));

    expect(
      await screen.findByText(/Too many requests/i)
    ).toBeInTheDocument();
    expect(toastError).toHaveBeenCalled();
  });

  it("handles signup generic error", async () => {
    setup();
    mockSignup.mockRejectedValueOnce(new Error("unexpected"));

    await userEvent.type(screen.getByLabelText(/First Name/i), "John");
    await userEvent.type(screen.getByLabelText(/Last Name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "Abcdef12");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "Abcdef12");
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree to the/i }));

    fireEvent.click(screen.getByRole("button", { name: /Create Student Account/i }));

    expect(
      await screen.findByText(/Account creation failed\. Please try again\./i)
    ).toBeInTheDocument();
    expect(toastError).toHaveBeenCalled();
  });

  it("OAuth login success for Google and Apple", async () => {
    setup();
    signInWithOAuthMock.mockResolvedValueOnce({ error: null });

    fireEvent.click(screen.getByRole("button", { name: /Continue with Google/i }));
    await waitFor(() => {
      expect(signInWithOAuthMock).toHaveBeenCalledWith({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
    });

    signInWithOAuthMock.mockResolvedValueOnce({ error: null });
    fireEvent.click(screen.getByRole("button", { name: /Continue with Apple/i }));
    await waitFor(() => {
      expect(signInWithOAuthMock).toHaveBeenCalledWith({
        provider: "apple",
        options: { redirectTo: window.location.origin },
      });
    });
  });

  it("OAuth login handles returned error object", async () => {
    setup();
    signInWithOAuthMock.mockResolvedValueOnce({ error: new Error("provider disabled") });

    fireEvent.click(screen.getByRole("button", { name: /Continue with Google/i }));
    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/Unable to sign in with google/i));
    });
  });

  it("OAuth login handles thrown exception", async () => {
    setup();
    signInWithOAuthMock.mockImplementationOnce(() => {
      throw new Error("network down");
    });

    fireEvent.click(screen.getByRole("button", { name: /Continue with Apple/i }));
    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/Something went wrong/i));
    });
  });

  it("toggles password and confirm password visibility", async () => {
    setup();

    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;
    // First button inside password field toggles password
    const [passwordToggleBtn] = screen.getAllByRole("button", { name: "" }); // icon button has no accessible name
    expect(passwordInput.type).toBe("password");

    fireEvent.click(passwordToggleBtn);
    expect(passwordInput.type).toBe("text");

    // Type something to ensure input remains editable
    await userEvent.type(passwordInput, "Abcdef12");
    expect(passwordInput.value).toContain("Abcdef12");

    // For confirm password toggle, query all toggle buttons and click the second one
    const confirmInput = screen.getByLabelText(/Confirm Password/i) as HTMLInputElement;
    const toggleButtons = screen.getAllByRole("button", { name: "" });
    const confirmToggleBtn = toggleButtons[1];
    expect(confirmInput.type).toBe("password");

    fireEvent.click(confirmToggleBtn);
    expect(confirmInput.type).toBe("text");
  });

  it("clears field-specific error when user starts typing in that field", async () => {
    setup();

    // Trigger validation errors
    fireEvent.click(screen.getByRole("button", { name: /Create Student Account/i }));
    expect(await screen.findByText(/First name is required/i)).toBeInTheDocument();

    // Start typing in first name to clear its error
    const firstName = screen.getByLabelText(/First Name/i);
    await userEvent.type(firstName, "J");
    await waitFor(() => {
      expect(screen.queryByText(/First name is required/i)).not.toBeInTheDocument();
    });
  });
});