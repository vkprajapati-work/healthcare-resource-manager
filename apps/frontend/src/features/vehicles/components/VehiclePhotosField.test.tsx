import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { createInitialVehiclePhotosValue } from '../types';
import { VehiclePhotosField } from './VehiclePhotosField';

import type { FileRef, VehiclePhotosValue } from '../types';

// `@/config/env` reads `import.meta.env`, which only exists under Vite —
// ts-jest transforms to CommonJS, so anything touching file URLs (this
// component resolves photo URLs) needs env mocked to run under Jest at all.
jest.mock('@/config/env', () => ({
  env: {
    MODE: 'test',
    VITE_API_BASE_URL: 'http://localhost:5000/api/v1',
    VITE_API_TIMEOUT_MS: 15000,
    VITE_APP_NAME: 'Healthcare Resource Manager',
  },
}));

function makeFile(name: string): File {
  return new File([new Uint8Array(1024)], name, { type: 'image/png' });
}

function ControlledField({ existingPhotos }: { existingPhotos: FileRef[] }) {
  const [value, setValue] = useState<VehiclePhotosValue>(() =>
    createInitialVehiclePhotosValue(existingPhotos),
  );
  return <VehiclePhotosField value={value} onChange={setValue} existingPhotos={existingPhotos} />;
}

describe('VehiclePhotosField', () => {
  it('shows the new preview after replacing a broken photo among several siblings', async () => {
    const photos: FileRef[] = [
      { id: 'a', fileUrl: '/uploads/a.png', originalName: 'a.png' },
      { id: 'b', fileUrl: '/uploads/b.png', originalName: 'b.png' },
      { id: 'c', fileUrl: '/uploads/c.png', originalName: 'c.png' },
    ];
    render(<ControlledField existingPhotos={photos} />);

    const images = screen.getAllByAltText('');
    expect(images).toHaveLength(3);
    fireEvent.error(images[1] as HTMLElement);

    expect(screen.getByText('Photo unavailable — click to replace')).toBeInTheDocument();

    const input = document.getElementById('vehicle-photo-b') as HTMLInputElement;
    await userEvent.upload(input, makeFile('replacement.png'));

    expect(screen.queryByText('Photo unavailable — click to replace')).not.toBeInTheDocument();
    expect(screen.getAllByAltText('')).toHaveLength(3);
  });

  it('shows a live preview for a brand-new photo added via the trailing add tile, and resets the tile itself', async () => {
    const photos: FileRef[] = [{ id: 'a', fileUrl: '/uploads/a.png', originalName: 'a.png' }];
    render(<ControlledField existingPhotos={photos} />);

    expect(screen.getAllByAltText('')).toHaveLength(1);

    const addInput = document.getElementById('vehicle-photo-add') as HTMLInputElement;
    await userEvent.upload(addInput, makeFile('new-photo.png'));

    // One existing preview + one brand-new preview now rendered.
    expect(screen.getAllByAltText('')).toHaveLength(2);
    // The trailing add tile itself is untouched by the pick — it reset back
    // to its own empty state so another photo can still be added after it.
    expect(screen.getByText('Click or drag an image here')).toBeInTheDocument();
  });
});
