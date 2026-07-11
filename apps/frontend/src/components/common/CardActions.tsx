interface CardActionsProps {
  onView: () => void;
  onEdit: () => void;
}

/** View | Edit footer shared by the doctor/driver/vehicle admin cards. */
export function CardActions({ onView, onEdit }: CardActionsProps) {
  return (
    <div className="flex divide-x divide-slate-100 border-t border-slate-100 text-sm font-medium">
      <button
        type="button"
        onClick={onView}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-bl-2xl py-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
        View
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-br-2xl py-2.5 font-semibold text-primary-600 transition-colors hover:bg-primary-50"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 13.5V19.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2H10.5"
          />
        </svg>
        Edit
      </button>
    </div>
  );
}
