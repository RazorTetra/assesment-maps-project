import { useState } from 'react';
import SekolahEditForm from '../components/sekolah/SekolahEditFormComponent';
import KonsentrasiList from '../components/konsentrasi/KonsentrasiListComponent';
import KompetensiAddForm from '../components/sekolah/KompetensiAddComponent';
import KompetensiEditForm from '../components/sekolah/KompetensiEditFormComponent';
import KompetensiList from '../components/sekolah/KompetensiListFormComponent';
import KonsentrasiAddForm from '../components/konsentrasi/KonsentrasiAddFormComponent';
import ErrorNotification from '../components/ErrorNotification';
import Modal from '../components/EditModal';
import KonsentrasiEditForm from '../components/konsentrasi/KonsentrasiEditFormComponent';

const DataKonsentrasiPage: React.FC = () => {
  const [selectedSekolahId, setSelectedSekolahId] = useState<string | null>(
    null,
  );
  const [selectedSekolahName, setSelectedSekolahName] = useState<string>(''); // State for selected school name
  const [editingSekolahId, setEditingSekolahId] = useState<string | null>(null);
  const [addingSekolah, setAddingSekolah] = useState<boolean>(false); // State for adding school
  const [addingKompetensi, setAddingKompetensi] = useState<boolean>(false); // State for adding kompetensi
  const [editingKompetensi, setEditingKompetensi] = useState<{
    id: string;
    kode: string;
  } | null>(null);
  const [selectedKonsentrasi, setSelectedKonsentrasi] = useState<{
    id: string | null;
    nama: string;
  }>({ id: null, nama: '' });
  const [refresh, setRefresh] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSuccess = () => {
    handleRefresh();
  };

  const handleRefresh = () => {
    setRefresh((prevRefresh) => !prevRefresh);
  };

  const handleEditKompetensi = (unitId: string, initialKode: string) => {
    setEditingKompetensi({ id: unitId, kode: initialKode });
  };

  const handleError = (message: string | string[]) => {
    const errorMessage = Array.isArray(message) ? message.join(', ') : message;
    setErrorMessage(errorMessage);
  };

  const handleEditSekolah = (id: string, nama: string) => {
    setSelectedKonsentrasi({ id, nama });
    setEditingSekolahId(id);
  };

  const handleAddSekolah = () => {
    setAddingSekolah(true);
  };

  const handleAddKompetensi = () => {
    setAddingKompetensi(true);
  };

  const handleViewKompetensi = (id: string, nama: string) => {
    setSelectedSekolahId(id);
    setSelectedSekolahName(nama); // Set the selected school name
  };

  return (
    <div className='bg-gray-100 min-h-screen p-6 dark:bg-gray-900 dark:text-gray-200'>
      {errorMessage && (
        <ErrorNotification
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      <div className='bg-white p-8 rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200'>
        <h1 className='text-2xl font-bold text-center mb-4 pt-8 dark:text-white'>
          Data Konsentrasi
        </h1>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-full max-w-3xl'>
            {!selectedSekolahId && !editingKompetensi && (
              <>
                <button
                  onClick={handleAddSekolah}
                  className='flex items-center text-black mb-4 bg-slate-300 hover:bg-slate-400 ease-in-out duration-300 p-2 rounded-md dark:text-gray-200 dark:bg-slate-600 dark:hover:bg-slate-700'
                >
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 4v16m8-8H4'
                    ></path>
                  </svg>
                  Data Konsentrasi
                </button>
                <KonsentrasiList
                  onEdit={handleEditSekolah}
                  onViewKompetensi={handleViewKompetensi}
                  refresh={refresh}
                  editingId={editingSekolahId}
                  onRefresh={handleRefresh} // Add onRefresh handler
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!editingSekolahId}
        onClose={() => setEditingSekolahId(null)}
      >
        <KonsentrasiEditForm
          id={selectedKonsentrasi.id || ''}
          initialNama={selectedKonsentrasi.nama}
          onSuccess={() => {
            setEditingSekolahId(null);
            handleRefresh();
          }}
          onError={handleError}
        />
      </Modal>

      <Modal
        isOpen={addingSekolah}
        onClose={() => setAddingSekolah(false)}
      >
        <KonsentrasiAddForm
          onAddSuccess={() => {
            setAddingSekolah(false);
            handleRefresh();
          }}
        />
      </Modal>

      <Modal
        isOpen={addingKompetensi}
        onClose={() => setAddingKompetensi(false)}
      >
        <KompetensiAddForm
          sekolahId={selectedSekolahId || ''} // Menyediakan string kosong sebagai nilai default
          onSuccess={() => {
            setAddingKompetensi(false);
            handleRefresh();
          }}
        />
      </Modal>
    </div>
  );
};

export default DataKonsentrasiPage;