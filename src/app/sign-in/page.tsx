import { redirect } from "next/navigation";

/** /sign-in moved to /login under the (auth) route group. */
export default function SignInPage() {
  redirect("/login");
}
