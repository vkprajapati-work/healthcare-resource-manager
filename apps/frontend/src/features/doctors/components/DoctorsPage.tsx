import { useState } from 'react';
import toast from 'react-hot-toast';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/Table';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { toAbsoluteFileUrl } from '@/lib/file-url';

import { useCreateDoctor, useDoctorsList } from '../hooks/use-doctors';
import { DoctorForm } from './DoctorForm';

import type { ProvisionedLogin } from '../types';

export function DoctorsPage() {
  const { page, setPage } = usePaginationParams();
  const { data, isPending, isError, error, refetch } = useDoctorsList(page);
  const createDoctor = useCreateDoctor();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [provisionedLogin, setProvisionedLogin] = useState<ProvisionedLogin | null>(null);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Doctors</h1>
        <Button onClick={() => setIsFormOpen(true)}>Add doctor</Button>
      </div>

      {isPending ? <Spinner label="Loading doctors" /> : null}

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load doctors.'}
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          message="No doctors yet."
          action={<Button onClick={() => setIsFormOpen(true)}>Add the first doctor</Button>}
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Profile</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Specialization</TableHeaderCell>
                <TableHeaderCell>Department</TableHeaderCell>
                <TableHeaderCell>City</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    {doctor.profileImage ? (
                      <img
                        src={toAbsoluteFileUrl(doctor.profileImage.fileUrl)}
                        alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                        loading="lazy"
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-500"
                      >
                        {doctor.firstName.charAt(0)}
                        {doctor.lastName.charAt(0)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.department}</TableCell>
                  <TableCell>{doctor.city}</TableCell>
                  <TableCell>{doctor.availabilityStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </>
      ) : null}

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add doctor"
        className="max-w-2xl"
      >
        <DoctorForm
          onCancel={() => setIsFormOpen(false)}
          onSubmit={async (input, profileImage) => {
            const result = await createDoctor.mutateAsync({ input, profileImage });
            toast.success('Doctor created.');
            setIsFormOpen(false);
            if (result.login) {
              setProvisionedLogin(result.login);
            }
          }}
        />
      </Dialog>

      <Dialog
        open={provisionedLogin !== null}
        onClose={() => setProvisionedLogin(null)}
        title="Login credentials created"
      >
        <p className="mb-4 text-sm text-slate-600">
          Share these one-time credentials with the doctor — the password is only shown now, and
          they must change it on first sign-in.
        </p>
        <dl className="mb-6 rounded-md bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Email</dt>
            <dd className="font-mono">{provisionedLogin?.email}</dd>
          </div>
          <div className="mt-2 flex justify-between gap-4">
            <dt className="text-slate-600">Temporary password</dt>
            <dd className="font-mono">{provisionedLogin?.defaultPassword}</dd>
          </div>
        </dl>
        <div className="flex justify-end">
          <Button onClick={() => setProvisionedLogin(null)}>Done</Button>
        </div>
      </Dialog>
    </section>
  );
}
