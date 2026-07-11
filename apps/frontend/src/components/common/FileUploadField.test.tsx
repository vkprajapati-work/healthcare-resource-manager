import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { FileUploadField } from './FileUploadField';

function makeFile(name: string): File {
  return new File(['content'], name, { type: 'image/png' });
}

function ControlledUploader({ multiple }: { multiple: boolean }) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <FileUploadField
      id="photos"
      label="Photos"
      multiple={multiple}
      files={files}
      onFilesChange={setFiles}
    />
  );
}

describe('FileUploadField', () => {
  it('accumulates files picked across separate selections in multi-file mode', async () => {
    render(<ControlledUploader multiple />);
    const input = screen.getByLabelText('Photos');

    await userEvent.upload(input, makeFile('a.png'));
    expect(screen.getByAltText('a.png')).toBeInTheDocument();

    await userEvent.upload(input, makeFile('b.png'));
    expect(screen.getByAltText('a.png')).toBeInTheDocument();
    expect(screen.getByAltText('b.png')).toBeInTheDocument();
    expect(screen.getByText('2 photos selected — choose again to add more.')).toBeInTheDocument();
  });

  it('replaces the selection in single-file mode', async () => {
    render(<ControlledUploader multiple={false} />);
    const input = screen.getByLabelText('Photos');

    await userEvent.upload(input, makeFile('a.png'));
    await userEvent.upload(input, makeFile('b.png'));

    expect(screen.queryByAltText('a.png')).not.toBeInTheDocument();
    expect(screen.getByAltText('b.png')).toBeInTheDocument();
  });

  it('removes an individual file via its remove button', async () => {
    render(<ControlledUploader multiple />);
    const input = screen.getByLabelText('Photos');

    await userEvent.upload(input, [makeFile('a.png'), makeFile('b.png')]);
    await userEvent.click(screen.getByRole('button', { name: 'Remove a.png' }));

    expect(screen.queryByAltText('a.png')).not.toBeInTheDocument();
    expect(screen.getByAltText('b.png')).toBeInTheDocument();
  });
});
