import { useState } from 'react';
import toast from 'react-hot-toast';

import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { SearchInput } from '@/components/common/SearchInput';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useListSearch } from '@/hooks/use-list-search';
import { usePaginationParams } from '@/hooks/use-pagination-params';

import {
  useCreateDoctor,
  useDeleteDoctor,
  useDoctorsList,
  useUpdateDoctor,
} from '../hooks/use-doctors';
import { doctorToFormDefaults } from '../schemas/doctor-form-schema';
import { DoctorCard } from './DoctorCard';
import { DoctorDetails } from './DoctorDetails';
import { DoctorForm } from './DoctorForm';

import type { Doctor, ProvisionedLogin } from '../types';

export function DoctorsPage() {
  const { page, setPage } = usePaginationParams();
  const { searchInput, setSearchInput, search } = useListSearch();
  const { data, isPending, isError, error, refetch } = useDoctorsList({ page, search });
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const deleteDoctor = useDeleteDoctor();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewing, setViewing] = useState<Doctor | null>(null);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState<Doctor | null>(null);
  const [provisionedLogin, setProvisionedLogin] = useState<ProvisionedLogin | null>(null);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Doctors</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data ? `${data.meta.totalItems} registered` : ' '}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput
              id="doctor-search"
              label="Search doctors"
              labelHidden
              value={searchInput}
              onValueChange={setSearchInput}
              placeholder="Search doctor"
            />
          </div>
          <Button onClick={() => setIsFormOpen(true)}>Add doctor</Button>
        </div>
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
          message={search ? 'No doctors match your search.' : 'No doctors yet.'}
          action={
            search ? (
              <Button variant="secondary" onClick={() => setSearchInput('')}>
                Clear search
              </Button>
            ) : (
              <Button onClick={() => setIsFormOpen(true)}>Add the first doctor</Button>
            )
          }
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onView={() => setViewing(doctor)}
                onEdit={() => setEditing(doctor)}
                onDelete={() => setDeleting(doctor)}
              />
            ))}
          </div>
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
          onSubmit={async (input) => {
            const result = await createDoctor.mutateAsync(input);
            toast.success('Doctor created.');
            setIsFormOpen(false);
            if (result.login) {
              setProvisionedLogin(result.login);
            }
          }}
        />
      </Dialog>

      <Dialog
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="Doctor details"
        className="max-w-lg"
      >
        {viewing ? <DoctorDetails doctor={viewing} /> : null}
      </Dialog>

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit doctor"
        className="max-w-2xl"
      >
        {editing ? (
          <DoctorForm
            key={editing.id}
            defaultValues={doctorToFormDefaults(editing)}
            existingPhoto={editing.profileImage}
            submitLabel="Save changes"
            onCancel={() => setEditing(null)}
            onSubmit={async (input) => {
              await updateDoctor.mutateAsync({ id: editing.id, input });
              toast.success('Doctor updated.');
              setEditing(null);
            }}
          />
        ) : null}
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
        <dl className="mb-6 rounded-lg bg-slate-50 p-4 text-sm">
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

      <ConfirmDialog
        open={deleting !== null}
        title="Delete doctor"
        description={
          deleting
            ? `Delete Dr. ${deleting.firstName} ${deleting.lastName}? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        isConfirming={deleteDoctor.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteDoctor.mutateAsync(deleting.id);
            toast.success('Doctor deleted.');
            setDeleting(null);
          } catch {
            // The global mutation-error toast already surfaced this;
            // keep the dialog open so the user can retry.
          }
        }}
      />
    </section>
  );
}
