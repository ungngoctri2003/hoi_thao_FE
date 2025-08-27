"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { time: "00:00", checkins: 0 },
  { time: "02:00", checkins: 2 },
  { time: "04:00", checkins: 1 },
  { time: "06:00", checkins: 5 },
  { time: "08:00", checkins: 45 },
  { time: "10:00", checkins: 89 },
  { time: "12:00", checkins: 67 },
  { time: "14:00", checkins: 123 },
  { time: "16:00", checkins: 98 },
  { time: "18:00", checkins: 34 },
  { time: "20:00", checkins: 12 },
  { time: "22:00", checkins: 3 },
]

export function RealtimeChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip
            labelFormatter={(value) => `Thời gian: ${value}`}
            formatter={(value) => [`${value} người`, "Check-in"]}
          />
          <Line
            type="monotone"
            dataKey="checkins"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
