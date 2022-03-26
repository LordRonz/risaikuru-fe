import axios from 'axios';
import type { NextPage } from 'next';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
import { FiUpload } from 'react-icons/fi';

import Button from '@/components/buttons/Button';
import { toastStyle } from '@/components/constant/toast';
import DragNDrop from '@/components/DragNDrop';
import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

type API_RESPONSE = [
  {
    className: 'Organic';
    probability: number;
  },
  {
    className: 'Reusable';
    probability: number;
  }
];

const Classify: NextPage = () => {
  const [selectedFile, setSelectedFile] = useState<File>();

  const onUpload = (files?: FileList | File[] | null) => {
    setSelectedFile(files?.[0]);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    if (!SUPPORTED_IMAGE_TYPES.includes(acceptedFiles[0].type)) {
      setSelectedFile(undefined);
      toast.error('File must be an image (jpeg, png, gif)');
      return;
    }
    onUpload(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    e.preventDefault();
    if (
      e?.currentTarget?.files?.[0]?.type &&
      !SUPPORTED_IMAGE_TYPES.includes(e.currentTarget.files[0].type)
    ) {
      e.target.value = '';
      setSelectedFile(undefined);
      toast.error('File must be an image (jpeg, png, gif)');
      return;
    }
    onUpload(e?.currentTarget?.files);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please upload an image');
      return;
    }
    const formData = new FormData();
    formData.append('image', selectedFile);
    toast.promise(axios.post<API_RESPONSE>('/api/classify', formData), {
      loading: 'Loading...',
      success: ({ data }) => {
        console.log(data);
        if (data[0].probability > data[1].probability) return data[0].className;
        return data[1].className;
      },
      error: (err: Error) => {
        if (axios.isAxiosError(err)) {
          return err.response?.data.message ?? err.message;
        }
        return err.message;
      },
    });
  };

  return (
    <Layout>
      <Seo templateTitle='Classify Trash' />
      <main>
        <section>
          <div className='layout flex min-h-screen flex-col items-center justify-center gap-y-40 text-center'>
            <form onSubmit={handleSubmit}>
              <DragNDrop
                onChange={onFileChange}
                rootProps={getRootProps()}
                inputProps={getInputProps()}
              >
                <FiUpload className='mr-4' />
                {selectedFile?.name ?? 'Upload Image'}
              </DragNDrop>
              <div className='mt-2'>
                <Button type='submit'>Submit</Button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Toaster
        toastOptions={{
          style: toastStyle,
          loading: {
            iconTheme: {
              primary: '#71f397',
              secondary: 'black',
            },
          },
        }}
      />
    </Layout>
  );
};

export default Classify;
