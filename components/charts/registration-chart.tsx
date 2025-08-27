"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { date: "01/12", registrations: 24 },
  { date: "02/12", registrations: 13 },
  { date: "03/12", registrations: 45 },
  { date: "04/12", registrations: 67 },
  { date: "05/12", registrations: 89 },
  { date: "06/12", registrations: 34 },
  { date: "07/12", registrations: 56 },
  { date: "08/12", registrations: 78 },
  { date: "09/12", registrations: 92 },
  { date: "10/12", registrations: 123 },
  { date: "11/12", registrations: 87 },
  { date: "12/12", registrations: 145 },
]

export function RegistrationChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip labelFormatter={(value) => `Ngày: ${value}`} formatter={(value) => [`${value} người`, "Đăng ký"]} />
          <Bar dataKey="registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
