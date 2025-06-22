import Link from "next/link";
import LoginForm from "./login-form";
import { NotebookText } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
            <Link href="/" className="flex items-center gap-2 justify-center mb-4">
                <NotebookText className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold font-headline">LearnLog</span>
            </Link>
          <h1 className="text-3xl font-bold font-headline">Admin Login</h1>
          <p className="text-balance text-muted-foreground">
            Enter your credentials to access the admin panel
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
