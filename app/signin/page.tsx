"use client";
import { signIn } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // ตรวจสอบ token จาก URL สำหรับ reset password
  useEffect(() => {
    const t = searchParams.get("token");
    if (t) {
      setToken(t);
      setIsResetPassword(true);
    }
  }, [searchParams]);

  // Validation
  const validateName = (value: string) => {
    if (isRegister && !value.trim()) setNameError("Name is required.");
    else setNameError(null);
  };
  const validateEmail = (value: string) => {
    if (!value.includes("@")) setEmailError("Invalid email format.");
    else setEmailError(null);
  };
  const validatePassword = (value: string) => {
    if (value.length < 6) setPasswordError("Password must be at least 6 characters.");
    else setPasswordError(null);
  };
  const validateConfirmPassword = (value: string) => {
    if (isRegister && value !== password) setConfirmPasswordError("Passwords do not match.");
    else setConfirmPasswordError(null);
  };
  const validateNewPassword = (value: string) => {
    if (value.length < 6) setNewPasswordError("Password must be at least 6 characters.");
    else setNewPasswordError(null);
  };

  // Google Sign In
  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await signIn("google", { callbackUrl: "/" });
    setLoading(false);
    if (result?.error) setError("Google login failed! Please try again.");
  }, [router]);

  // Forgot password submit
  const handleForgotPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setMessage(null);
      if (emailError) {
        setLoading(false);
        return;
      }
      const res = await fetch("/api/service/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setLoading(false);
      if (res.ok) setMessage("Password reset link has been sent to your email.");
      else {
        const data = await res.json();
        setError(data.message || "Failed to send reset link.");
      }
    },
    [email, emailError]
  );

  // Reset password submit
  const handleResetPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      if (!token || newPasswordError) {
        setLoading(false);
        return;
      }
      const res = await fetch("/api/service/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      setLoading(false);
      if (res.ok) {
        setMessage("Password has been reset successfully!");
        setIsResetPassword(false);
        setToken(null);
        setNewPassword("");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to reset password.");
      }
    },
    [token, newPassword, newPasswordError]
  );

  // Login / Register submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      if (nameError || emailError || passwordError || confirmPasswordError) {
        setLoading(false);
        return;
      }
      if (isRegister) {
        const res = await fetch("/api/service/singup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        setLoading(false);
        if (res.ok) {
          await signIn("credentials", { redirect: false, email, password });
          router.push("/");
        } else {
          const data = await res.json();
          setError(data.message || "Register failed!");
        }
      } else {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        setLoading(false);
        if (result?.error) setError(result.error);
        else router.push("/");
      }
    },
    [isRegister, email, password, name, router, emailError, passwordError, confirmPasswordError, nameError]
  );

  return (
    <div className="flex min-h-screen bg-neutral-900">
      <div className="flex flex-col sm:flex-row shadow-xl max-w-md sm:max-w-lg ml-auto h-screen">
        <div className="flex flex-col justify-center items-center bg-white w-full sm:w-[28rem] h-full p-10">
          <h1 className="text-4xl font-extrabold text-black mb-10 tracking-tight">
            Zound <span className="text-purple-600">Mood</span>
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {message && <p className="text-green-600 text-center mb-4">{message}</p>}

          {/* Reset Password Form */}
          {isResetPassword ? (
            <form className="space-y-5 w-full max-w-sm" onSubmit={handleResetPassword}>
              <div>
                <input
                  required
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    validateNewPassword(e.target.value);
                  }}
                  className={`w-full p-3 border rounded-full ${
                    newPasswordError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {newPasswordError && <p className="text-red-500 text-sm mt-1">{newPasswordError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full p-3 bg-neutral-800 hover:bg-black text-white text-lg font-semibold rounded-full"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <p
                className="text-gray-500 text-sm mt-4 text-center cursor-pointer"
                onClick={() => {
                  setIsResetPassword(false);
                  setToken(null);
                }}
              >
                Back to Sign In
              </p>
            </form>
          ) : isForgotPassword ? (
            <form className="space-y-5 w-full max-w-sm" onSubmit={handleForgotPassword}>
              <div>
                <input
                  required
                  className={`w-full p-3 border rounded-full text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 ${
                    emailError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateEmail(e.target.value);
                  }}
                />
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
              </div>

              <button
                className="w-full p-3 bg-neutral-800 hover:bg-black text-white text-lg font-semibold rounded-full transition-all duration-200 shadow-md"
                disabled={loading}
                type="submit"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-gray-500 text-sm mt-8 text-center">
                Remembered your password?{" "}
                <button
                  type="button"
                  className="text-purple-500 hover:underline font-semibold"
                  onClick={() => setIsForgotPassword(false)}
                >
                  Back to Sign In
                </button>
              </p>
            </form>
          ) : (
            // Sign in / Register Form
            <>
              <form className="space-y-5 w-full max-w-sm" onSubmit={handleSubmit}>
                {isRegister && (
                  <div>
                    <input
                      required
                      className={`w-full p-3 border rounded-full text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 ${
                        nameError ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        validateName(e.target.value);
                      }}
                    />
                    {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                  </div>
                )}

                <div>
                  <input
                    required
                    className={`w-full p-3 border rounded-full text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 ${
                      emailError ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateEmail(e.target.value);
                    }}
                  />
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>

                <div>
                  <input
                    required
                    className={`w-full p-3 border rounded-full text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 ${
                      passwordError ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                      validateConfirmPassword(confirmPassword);
                    }}
                  />
                  {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                </div>

                {isRegister && (
                  <div>
                    <input
                      required
                      className={`w-full p-3 border rounded-full text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 ${
                        confirmPasswordError ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        validateConfirmPassword(e.target.value);
                      }}
                    />
                    {confirmPasswordError && (
                      <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
                    )}
                  </div>
                )}

                <button
                  className="w-full p-3 bg-neutral-800 hover:bg-black text-white text-lg font-semibold rounded-full transition-all duration-200 shadow-md"
                  disabled={loading}
                  type="submit"
                >
                  {loading
                    ? isRegister
                      ? "Registering..."
                      : "Signing In..."
                    : isRegister
                    ? "Register"
                    : "Sign In"}
                </button>
              </form>

              <div className="flex items-center my-6">
                <hr className="flex-grow border-gray-300" />
                <span className="mx-2 text-gray-500 text-sm">or</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-full hover:bg-gray-50 transition"
              >
                <span className="text-gray-700 font-medium">
                  {isRegister ? "Register with Google" : "Sign in with Google"}
                </span>
              </button>

              {!isRegister && (
                <p
                  className="text-purple-500 hover:underline text-sm mt-4 cursor-pointer"
                  onClick={() => setIsForgotPassword(true)}
                >
                  Forgot Password?
                </p>
              )}

              <p className="text-gray-500 text-sm mt-8">
                {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
                <button
                  type="button"
                  className="text-purple-500 hover:underline font-semibold"
                  onClick={() => setIsRegister(!isRegister)}
                >
                  {isRegister ? "Sign In" : "Register"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
