"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { questions, quizAttempts } from "@/lib/data"
import { Card } from "@/components/ui/card"
import { ChartTooltipContent } from "@/components/ui/chart"

function getMissedQuestionsData() {
  const missedCount: { [key: number]: number } = {}
  quizAttempts.forEach(attempt => {
    attempt.missedQuestionIds.forEach(id => {
      missedCount[id] = (missedCount[id] || 0) + 1
    })
  })

  return Object.entries(missedCount)
    .map(([id, count]) => {
      const question = questions.find(q => q.id === Number(id))
      return {
        name: question ? `Q${id}: ${question.question.substring(0, 15)}...` : `Question ${id}`,
        missed: count,
      }
    })
    .sort((a, b) => b.missed - a.missed)
    .slice(0, 5) // Top 5
}

export default function StatsChart() {
  const data = getMissedQuestionsData()

  if(data.length === 0) {
      return (
          <Card className="h-[350px] w-full flex items-center justify-center">
              <p className="text-muted-foreground">No missed question data available.</p>
          </Card>
      )
  }

  return (
    <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent />}
                />
                <Bar dataKey="missed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
  )
}
