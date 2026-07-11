import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, className, children }: ChartCardProps): JSX.Element {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
