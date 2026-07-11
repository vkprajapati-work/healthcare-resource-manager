import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/Table';

import { ChartCard } from './ChartCard';

import type { ComplianceAlert } from '../types';

interface ComplianceTableProps {
  alerts: ComplianceAlert[];
}

export function ComplianceTable({ alerts }: ComplianceTableProps) {
  return (
    <ChartCard title="Compliance alerts" subtitle="Documents expiring soon">
      {alerts.length === 0 ? (
        <EmptyState message="No compliance alerts — everything is up to date." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Entity</TableHeaderCell>
              <TableHeaderCell>Document</TableHeaderCell>
              <TableHeaderCell>Expires on</TableHeaderCell>
              <TableHeaderCell>Days left</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{alert.entityName}</TableCell>
                <TableCell>{alert.type}</TableCell>
                <TableCell>{new Date(alert.expiresOn).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={alert.severity}>{alert.daysRemaining} days</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </ChartCard>
  );
}
