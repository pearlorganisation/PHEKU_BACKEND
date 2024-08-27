import dotenv from "dotenv";
dotenv.config();

export const DB_NAME = "Pheku_DB";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV !== "development",
};

export const USER_ROLES_ENUM = {
  STUDENT: "STUDENT",
  PARENT: "PARENT",
  COUNSELOR: "COUNSELOR",
  LECTURER: "LECTURER",
  COURSE_MANAGER: "COURSE_MANAGER",
  AGENT: "AGENT",
  INSTITUTION: "INSTITUTION",
  JOBS_MANAGER: "JOBS_MANAGER",
  ACCOMMODATION_MANAGER: "ACCOMMODATION_MANAGER",
  MARKETING_MANAGER: "MARKETING_MANAGER",
  TECHNICAL_MANAGER: "TECHNICAL_MANAGER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
};

export const AVAILABLE_USER_ROLES = Object.values(USER_ROLES_ENUM);
