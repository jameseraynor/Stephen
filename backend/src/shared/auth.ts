/**
 * Authentication Utilities
 *
 * Extract and validate user information from Cognito JWT tokens.
 */

import { APIGatewayProxyEvent } from "aws-lambda";

export interface AuthUser {
  userId: string;
  email: string;
  givenName: string;
  familyName: string;
  groups: string[];
  role: "Admin" | "ProjectManager" | "Viewer";
}

/**
 * Extract user from API Gateway event
 * User info is provided by Cognito Authorizer
 */
export function getUserFromEvent(event: APIGatewayProxyEvent): AuthUser {
  const claims = event.requestContext.authorizer?.claims;

  if (!claims) {
    throw new Error("No authorization claims found");
  }

  const groups = claims["cognito:groups"]
    ? claims["cognito:groups"].split(",")
    : [];

  // Determine role from groups (Admin > ProjectManager > Viewer)
  let role: AuthUser["role"] = "Viewer";
  if (groups.includes("Admin")) {
    role = "Admin";
  } else if (groups.includes("ProjectManager")) {
    role = "ProjectManager";
  }

  return {
    userId: claims.sub,
    email: claims.email,
    givenName: claims.given_name || "",
    familyName: claims.family_name || "",
    groups,
    role,
  };
}

/**
 * Check if user has required role
 */
export function hasRole(
  user: AuthUser,
  requiredRole: "Admin" | "ProjectManager" | "Viewer",
): boolean {
  const roleHierarchy = {
    Admin: 3,
    ProjectManager: 2,
    Viewer: 1,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

/**
 * Require specific role (throws if not authorized)
 */
export function requireRole(
  user: AuthUser,
  requiredRole: "Admin" | "ProjectManager" | "Viewer",
): void {
  if (!hasRole(user, requiredRole)) {
    throw new Error(
      `Insufficient permissions. Required role: ${requiredRole}, User role: ${user.role}`,
    );
  }
}

/**
 * Check if user is in specific group
 */
export function isInGroup(user: AuthUser, groupName: string): boolean {
  return user.groups.includes(groupName);
}
