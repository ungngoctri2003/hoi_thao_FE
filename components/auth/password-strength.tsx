"use client"

import { useMemo } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface PasswordRule {
  label: string
  test: (password: string) => boolean
}

const passwordRules: PasswordRule[] = [
  {
    label: "Ít nhất 8 ký tự",
    test: (password) => password.length >= 8,
  },
  {
    label: "Có chữ hoa",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "Có chữ thường",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "Có số",
    test: (password) => /\d/.test(password),
  },
  {
    label: "Có ký tự đặc biệt",
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
]

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    const passedRules = passwordRules.filter((rule) => rule.test(password))
    return {
      score: passedRules.length,
      percentage: (passedRules.length / passwordRules.length) * 100,
      level:
        passedRules.length <= 2
          ? "weak"
          : passedRules.length <= 3
            ? "medium"
            : passedRules.length <= 4
              ? "good"
              : "strong",
    }
  }, [password])

  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    good: "bg-blue-500",
    strong: "bg-green-500",
  }

  const strengthLabels = {
    weak: "Yếu",
    medium: "Trung bình",
    good: "Tốt",
    strong: "Mạnh",
  }

  if (!password) return null

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Độ mạnh mật khẩu</span>
          <span className={cn("font-medium", strength.level === "strong" ? "text-green-600" : "text-muted-foreground")}>
            {strengthLabels[strength.level as keyof typeof strengthLabels]}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", strengthColors[strength.level as keyof typeof strengthColors])}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
      </div>

      {/* Rules Checklist */}
      <div className="space-y-1">
        {passwordRules.map((rule, index) => {
          const passed = rule.test(password)
          return (
            <div key={index} className="flex items-center space-x-2 text-xs">
              {passed ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
              <span className={cn(passed ? "text-green-600" : "text-muted-foreground")}>{rule.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
