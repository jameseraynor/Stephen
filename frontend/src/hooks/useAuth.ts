/**
 * useAuth Hook
 *
 * Custom hook for authentication with AWS Cognito.
 * Provides login, logout, signup, and user state management.
 */

import { useState, useEffect, useCallback } from "react";
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession,
  type SignInInput,
  type SignUpInput,
} from "aws-amplify/auth";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    givenName: string,
    familyName: string,
  ) => Promise<void>;
  confirmSignup: (email: string, code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * Parse Cognito user to our User type
 */
function parseUser(cognitoUser: any, session: any): User {
  const groups = session?.tokens?.accessToken?.payload["cognito:groups"] || [];

  // Determine role from groups (Admin > ProjectManager > Viewer)
  let role: User["role"] = "Viewer";
  if (groups.includes("Admin")) {
    role = "Admin";
  } else if (groups.includes("ProjectManager")) {
    role = "ProjectManager";
  }

  return {
    id: cognitoUser.userId,
    email: cognitoUser.signInDetails?.loginId || "",
    givenName: session?.tokens?.idToken?.payload?.given_name || "",
    familyName: session?.tokens?.idToken?.payload?.family_name || "",
    role,
    groups,
  };
}

/**
 * useAuth Hook
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Fetch current user
   */
  const fetchUser = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const cognitoUser = await getCurrentUser();
      const session = await fetchAuthSession();

      const user = parseUser(cognitoUser, session);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // Not an error if user is not logged in
      });
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Login
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const signInInput: SignInInput = {
          username: email,
          password,
        };

        await signIn(signInInput);
        await fetchUser();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error("Login failed"),
        }));
        throw error;
      }
    },
    [fetchUser],
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await signOut();

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error("Logout failed"),
      }));
      throw error;
    }
  }, []);

  /**
   * Signup
   */
  const signup = useCallback(
    async (
      email: string,
      password: string,
      givenName: string,
      familyName: string,
    ) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const signUpInput: SignUpInput = {
          username: email,
          password,
          options: {
            userAttributes: {
              email,
              given_name: givenName,
              family_name: familyName,
            },
          },
        };

        await signUp(signUpInput);

        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error("Signup failed"),
        }));
        throw error;
      }
    },
    [],
  );

  /**
   * Confirm signup
   */
  const confirmSignup = useCallback(async (email: string, code: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error : new Error("Confirmation failed"),
      }));
      throw error;
    }
  }, []);

  /**
   * Refresh user
   */
  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    logout,
    signup,
    confirmSignup,
    refreshUser,
    clearError,
  };
}
