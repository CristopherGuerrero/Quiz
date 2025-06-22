import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { quizAttempts } from "@/lib/data"

export default function UsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Attempts</CardTitle>
        <CardDescription>
          A log of all quiz attempts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Correct</TableHead>
                    <TableHead>Wrong</TableHead>
                    <TableHead>Duration</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quizAttempts.map((attempt) => {
                        const total = attempt.correctAnswers + attempt.wrongAnswers;
                        const score = total > 0 ? (attempt.correctAnswers / total) * 100 : 0;
                        return (
                            <TableRow key={attempt.id}>
                                <TableCell className="font-medium">{attempt.userName}</TableCell>
                                <TableCell>{new Date(attempt.date).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant={score > 50 ? "default" : "destructive"}>
                                        {score.toFixed(0)}%
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-green-600">{attempt.correctAnswers}</TableCell>
                                <TableCell className="text-destructive">{attempt.wrongAnswers}</TableCell>
                                <TableCell>{attempt.durationSeconds}s</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  )
}
