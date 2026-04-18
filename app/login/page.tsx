"use client";
import styles from "./login.module.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import { motion } from "motion/react";
import { KeyRound, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-border shadow-2xl shadow-primary/5 bg-white overflow-hidden">
          <div className="h-2 bg-primary"></div>
          <CardHeader className="space-y-2 p-8 pt-10">
            <CardTitle className="text-3xl font-black tracking-tight text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Enter your credentials to access your DriveSync account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-10 border-border bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                  <Link href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight">Forgot password?</Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 border-border bg-white"
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-bold animate-shake">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90 text-sm font-bold tracking-tight rounded-xl group transition-all">
                {loading ? "Verifying..." : (
                  <span className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold">
                  <span className="bg-white px-3 text-muted-foreground">New to DriveSync?</span>
                </div>
              </div>
              <Button variant="outline" asChild className="w-full h-12 border-border hover:bg-muted/50 text-sm font-bold tracking-tight rounded-xl">
                <Link href="/register">Create persistent account</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
