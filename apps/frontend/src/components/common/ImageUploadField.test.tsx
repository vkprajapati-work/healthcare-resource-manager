import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { EMPTY_IMAGE_VALUE, ImageUploadField } from './ImageUploadField';

import type { ImageFieldValue } from './ImageUploadField';

function makeFile(name: string, options?: { type?: string; size?: number }): File {
  const type = options?.type ?? 'image/png';
  const size = options?.size ?? 1024;
  const file = new File([new Uint8Array(size)], name, { type });
  return file;
}

function ControlledField(props: {
  existingImageUrl?: string | null;
  initialValue?: ImageFieldValue;
}) {
  const [value, setValue] = useState<ImageFieldValue>(props.initialValue ?? EMPTY_IMAGE_VALUE);
  return (
    <ImageUploadField
      id="avatar"
      label="Profile image"
      existingImageUrl={props.existingImageUrl}
      value={value}
      onChange={setValue}
    />
  );
}

describe('ImageUploadField', () => {
  it('shows a placeholder when there is no image', () => {
    render(<ControlledField />);
    expect(screen.getByText('Click or drag an image here')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('shows the existing image when one is provided and no new file is selected', () => {
    render(<ControlledField existingImageUrl="https://example.com/photo.png" />);
    expect(screen.queryByText('Click or drag an image here')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Profile image' })).toBeInTheDocument();
  });

  it('replaces the placeholder with a preview after picking a valid file', async () => {
    render(<ControlledField />);
    const input = document.getElementById('avatar') as HTMLInputElement;

    await userEvent.upload(input, makeFile('me.png'));

    expect(screen.queryByText('Click or drag an image here')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Profile image' })).toBeInTheDocument();
  });

  it('rejects a file of the wrong type with an inline error and keeps the placeholder', () => {
    // Dropping (unlike a native file-picker selection) isn't filtered by the
    // input's `accept` attribute, so it's the right path to exercise our
    // own validation against a mismatched file.
    render(<ControlledField />);
    const dropZone = screen.getByText('Click or drag an image here').closest('div');

    fireEvent.drop(dropZone as HTMLElement, {
      dataTransfer: { files: [makeFile('doc.pdf', { type: 'application/pdf' })] },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/unsupported file type/i);
    expect(screen.getByText('Click or drag an image here')).toBeInTheDocument();
  });

  it('rejects a file over the size limit', () => {
    render(<ControlledField />);
    const dropZone = screen.getByText('Click or drag an image here').closest('div');

    fireEvent.drop(dropZone as HTMLElement, {
      dataTransfer: { files: [makeFile('huge.png', { size: 6 * 1024 * 1024 })] },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/too large/i);
  });

  it('asks for confirmation before removing, and restores the placeholder on confirm', async () => {
    render(<ControlledField existingImageUrl="https://example.com/photo.png" />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove Profile image' }));
    expect(screen.getByText('Remove this image?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Remove this image?')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Profile image' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Remove Profile image' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

    expect(screen.getByText('Click or drag an image here')).toBeInTheDocument();
  });

  it('accepts a dropped file', () => {
    render(<ControlledField />);
    const dropZone = screen.getByText('Click or drag an image here').closest('div');

    fireEvent.drop(dropZone as HTMLElement, {
      dataTransfer: { files: [makeFile('dropped.png')] },
    });

    expect(screen.queryByText('Click or drag an image here')).not.toBeInTheDocument();
  });

  it('shows a distinct "unavailable" state for an existing image that fails to load, not the generic empty placeholder', () => {
    render(<ControlledField existingImageUrl="https://example.com/broken.png" />);

    fireEvent.error(screen.getByAltText(''));

    expect(screen.getByText('Photo unavailable — click to replace')).toBeInTheDocument();
    expect(screen.queryByText('Click or drag an image here')).not.toBeInTheDocument();
  });

  it('shows the new preview after replacing a broken existing image, not the stale "unavailable" state', async () => {
    render(<ControlledField existingImageUrl="https://example.com/broken.png" />);
    fireEvent.error(screen.getByAltText(''));
    expect(screen.getByText('Photo unavailable — click to replace')).toBeInTheDocument();

    const input = document.getElementById('avatar') as HTMLInputElement;
    await userEvent.upload(input, makeFile('replacement.png'));

    expect(screen.queryByText('Photo unavailable — click to replace')).not.toBeInTheDocument();
    expect(screen.getByAltText('')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Profile image' })).toBeInTheDocument();
  });

  it('trusts a freshly picked local file even if it happens to report tiny dimensions on load, unlike an existing server image', async () => {
    render(<ControlledField existingImageUrl="https://example.com/broken.png" />);
    fireEvent.error(screen.getByAltText(''));
    expect(screen.getByText('Photo unavailable — click to replace')).toBeInTheDocument();

    const input = document.getElementById('avatar') as HTMLInputElement;
    await userEvent.upload(input, makeFile('replacement.png'));

    // Simulate the new <img>'s load event reporting tiny natural dimensions
    // (whatever the real-world cause — decode timing, a slow blob read).
    // The degenerate-dimension heuristic exists for server-provided images,
    // not for a file the user just selected off their own device.
    const img = screen.getByAltText('');
    Object.defineProperty(img, 'naturalWidth', { value: 1, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 1, configurable: true });
    fireEvent.load(img);

    expect(screen.queryByText('Photo unavailable — click to replace')).not.toBeInTheDocument();
    expect(screen.getByAltText('')).toBeInTheDocument();
  });

  it('renders read-only mode without any interactive controls', () => {
    render(
      <ImageUploadField
        id="readonly-avatar"
        label="Profile image"
        existingImageUrl="https://example.com/photo.png"
        value={EMPTY_IMAGE_VALUE}
        onChange={jest.fn()}
        readOnly
      />,
    );

    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /change/i })).not.toBeInTheDocument();
  });
});
