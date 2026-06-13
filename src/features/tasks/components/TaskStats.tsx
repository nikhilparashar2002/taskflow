'use client';

import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { getTaskStats } from '@/utils/taskStats';
import type { Task } from '@/types/task';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: string;
}

function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function TaskStats({ tasks }: { tasks: Task[] }) {
  const { total, completed, pending, completionRate } = getTaskStats(tasks);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Total Tasks"
        value={total}
        icon={ListTodo}
        accent="bg-primary/10 text-primary"
      />
      <StatCard
        label="Completed"
        value={completed}
        icon={CheckCircle2}
        accent="bg-success/10 text-success"
      />
      <StatCard
        label="Pending"
        value={pending}
        icon={Clock}
        accent="bg-amber-500/10 text-amber-600 dark:text-amber-500"
      />
      <StatCard
        label="Completion"
        value={`${completionRate}%`}
        icon={TrendingUp}
        accent="bg-blue-500/10 text-blue-600 dark:text-blue-500"
      />
    </div>
  );
}
