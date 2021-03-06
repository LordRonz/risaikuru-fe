import axios from 'axios';
import type { NextPage } from 'next';
import { useTheme } from 'next-themes';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { FiUpload } from 'react-icons/fi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import Accent from '@/components/Accent';
import Button from '@/components/buttons/Button';
import ClassifyResult from '@/components/ClassifyResult';
import DragNDrop from '@/components/DragNDrop';
import Layout from '@/components/layout/Layout';
import CustomLink from '@/components/links/CustomLink';
import Seo from '@/components/Seo';

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MeSwal = withReactContent(Swal);

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
  const { theme } = useTheme();
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
        const result =
          data[0].probability > data[1].probability
            ? data[0].className
            : data[1].className;
        MeSwal.fire({
          html: <ClassifyResult type={result} />,
          color: theme === 'dark' ? '#ddd' : '#111',
          confirmButtonColor: '#71f397',
          background: theme === 'dark' ? '#111' : '#ddd',
        });
        return result;
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
          <div className='layout flex min-h-screen flex-col items-center justify-center gap-y-16 text-center'>
            <h1>
              <Accent className='dark:from-primary-100 dark:via-green-100/70 dark:to-emerald-100'>
                Choose from your trash
              </Accent>
            </h1>
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
            <CustomLink href='/classifycam' className='text-green-100'>
              Use your camera instead
            </CustomLink>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Classify;
