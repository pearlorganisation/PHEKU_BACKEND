import path from "path";
import { fileURLToPath } from "url";

// Get the __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const filePath = path.join(
  __dirname,
  "../../views/emails/resetPassword.ejs"
);
