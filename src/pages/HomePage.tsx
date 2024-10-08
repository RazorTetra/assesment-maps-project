import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/homepage/Sidebar';
import BottomBar from '../components/homepage/BottomBar';
import Loading from '../components/Loading';
import { MapContainer, TileLayer, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllSekolah } from '../api/sekolah-api';
import L from 'leaflet';
import debounce from 'lodash.debounce';
import useSidebarBottombar from '../hooks/useSidebarBottombar';
import CustomMarker from '../components/CustomMarker';
import { geocodeAddress } from '../utils/geocodeAddress';

interface Kompetensi {
  kode: string;
  nama: string;
  unit_kompetensi: UnitKompetensi[];
}

interface School {
  id: string;
  nama: string;
  kota: string;
  lat?: number;
  lng?: number;
  kecocokan?: string;
  jumlah_siswa?: number;
  jumlah_kelulusan?: number;
  persentase_kelulusan?: string;
  kompetensi?: Kompetensi[];
  okupasi?: string;
  kode_okupasi?: string;
  unit_kompetensi?: UnitKompetensi[];
  konsentrasi?: Konsentrasi[];
}

interface UnitKompetensi {
  id: string;
  kode_unit: string;
  nama: string;
  standard_kompetensi: string;
}

interface Konsentrasi {
  id: string;
  nama: string;
}

interface PopupInfo {
  name: string;
  position: L.LatLng;
  details: School;
}

const HomePage: React.FC = () => {
  const [, setInitialSchools] = useState<School[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 1.3017,
    lng: 124.9113,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [markers, setMarkers] = useState<L.LatLng[]>([]);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  const bounds = {
    north: 4.834726,
    south: 0.226033,
    east: 127.797571,
    west: 122.932839,
  };

  const screenSize = useSidebarBottombar();

  useEffect(() => {
    const fetchInitialSchools = async () => {
      try {
        const response = await getAllSekolah();
        if (response && Array.isArray(response.data)) {
          const schoolsWithCoords = response.data.filter(
            (school: School) =>
              school.lat !== undefined && school.lng !== undefined,
          );
          setInitialSchools(schoolsWithCoords);
          if (schoolsWithCoords.length > 0) {
            const avgLat =
              schoolsWithCoords.reduce(
                (sum: number, school: School) => sum + (school.lat ?? 0),
                0,
              ) / schoolsWithCoords.length;
            const avgLng =
              schoolsWithCoords.reduce(
                (sum: number, school: School) => sum + (school.lng ?? 0),
                0,
              ) / schoolsWithCoords.length;
            setCenter({ lat: avgLat, lng: avgLng });
          }
        } else {
          console.error('Expected an array but got:', response);
        }
      } catch (error) {
        console.error('Error fetching initial schools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSchools();
  }, []);

  const fetchGeocode = async (schoolName: string, schoolDetails: School) => {
    setIsLoadingLocation(true);
    try {
      const address = `${schoolName}, ${schoolDetails.kota}, Sulawesi Utara, Indonesia`;
      const result = await geocodeAddress(address);
      handleGeocodeResult(result, schoolName, schoolDetails);
    } catch (error) {
      console.error('Error fetching geocode data:', error);
      console.log(
        `Tidak dapat menemukan lokasi untuk: ${schoolName}, ${schoolDetails.kota}`,
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleGeocodeResult = (
    result: { lat: number; lng: number },
    schoolName: string,
    schoolDetails: School,
  ) => {
    const position = new L.LatLng(result.lat, result.lng);
    setMarkers([position]);
    setPopupInfo({
      name: schoolName,
      position,
      details: schoolDetails,
    });
    setCenter({ lat: result.lat, lng: result.lng });
  };

  const debouncedFetchGeocode = useCallback(debounce(fetchGeocode, 1000), []);

  const handleSchoolClick = (schoolName: string, schoolDetails: School) => {
    debouncedFetchGeocode(schoolName, schoolDetails);
  };

  const MapBoundsSetter = () => {
    const map = useMap();

    useEffect(() => {
      map.setMaxBounds([
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      ]);
      map.on('zoomend', () => {
        if (map.getZoom() < map.getMinZoom()) {
          map.setZoom(map.getMinZoom());
        }
      });
    }, [map]);

    useEffect(() => {
      if (markers.length > 0) {
        map.setView(markers[0], map.getZoom());
      }
    }, [markers, map]);

    return null;
  };

  const formatPercentage = (numerator: number, denominator: number): string => {
    if (denominator === 0) return '0%';
    return ((numerator / denominator) * 100).toFixed(2) + '%';
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='relative flex flex-col sm:flex-row h-screen overflow-hidden dark:bg-gray-800'>
      {isLoadingLocation && (
        <div className='absolute inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-50'>
          <div className='bg-white p-4 rounded shadow dark:bg-gray-800'>
            <p className='text-lg font-semibold dark:text-gray-200'>
              Mencari lokasi...
            </p>
          </div>
        </div>
      )}
      <div
        className='flex-grow h-full'
        style={{ zIndex: 0, paddingTop: '64px' }}
      >
        <MapContainer
          center={center}
          zoom={12}
          minZoom={10}
          maxZoom={16}
          scrollWheelZoom={true}
          className='h-full w-full sm:h-screen sm:w-screen'
        >
          <MapBoundsSetter />
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {markers.map((position, index) => (
            <CustomMarker
              key={index}
              position={position}
              eventHandlers={{
                click: () => {},
              }}
            >
              <Popup>
                <div className='max-h-72 max-w-96 overflow-y-auto pt-4 pb-4 pr-6 dark:bg-gray-900 dark:text-gray-200'>
                  <h3 className='text-xl font-semibold mb-2 underline mr-3'>
                    {popupInfo?.name}
                  </h3>
                  <p className='text-base sm:text-lg text-gray-700 dark:text-gray-400'>
                    <strong>Kota:</strong> {popupInfo?.details.kota}
                  </p>
                  {popupInfo?.details.kecocokan !== undefined && (
                    <p className='text-base sm:text-lg text-gray-700 dark:text-gray-400 mb-2'>
                      <strong>Kecocokan:</strong> {popupInfo.details.kecocokan}%
                    </p>
                  )}
                  {popupInfo?.details.jumlah_siswa !== undefined && (
                    <p className='text-base sm:text-lg text-gray-700 dark:text-gray-400'>
                      <strong>Jumlah Siswa:</strong>{' '}
                      {popupInfo.details.jumlah_siswa}
                    </p>
                  )}
                  {popupInfo?.details.jumlah_kelulusan !== undefined && (
                    <p className='text-base text-gray-700 dark:text-gray-400 mb-4'>
                      <strong>Jumlah Kelulusan:</strong>{' '}
                      {popupInfo.details.jumlah_kelulusan}
                      {popupInfo.details.jumlah_siswa && (
                        <span>
                          {' '}
                          (
                          {formatPercentage(
                            popupInfo.details.jumlah_kelulusan,
                            popupInfo.details.jumlah_siswa,
                          )}
                          )
                        </span>
                      )}
                    </p>
                  )}
                  {popupInfo?.details.konsentrasi &&
                  popupInfo?.details.konsentrasi.length > 0 ? (
                    <>
                      <p className='text-base text-gray-700 dark:text-gray-400 mb-4'>
                        <strong>
                          Konsentrasi:{' '}
                          {popupInfo?.details.konsentrasi.length < 2
                            ? popupInfo?.details.konsentrasi[0]?.nama
                            : ''}
                        </strong>
                      </p>
                      <ul className='list-disc list-inside text-base sm:text-lg text-gray-700 dark:text-gray-400'>
                        {popupInfo?.details.konsentrasi.map(
                          (k: Konsentrasi) => (
                            <li
                              key={k.id}
                              className='mb-1'
                            >
                              {k.nama}
                            </li>
                          ),
                        )}
                      </ul>
                    </>
                  ) : (
                    <p className='text-base text-gray-700 dark:text-gray-400 mb-4'>
                      Tidak ada konsentrasi terdaftar
                    </p>
                  )}
                  {popupInfo?.details.okupasi && (
                    <div>
                      {popupInfo.details.unit_kompetensi &&
                        popupInfo.details.unit_kompetensi.length > 0 && (
                          <div className='mt-2'>
                            <h4 className='text-base sm:text-lg font-semibold dark:text-gray-300'>
                              Unit Kompetensi:
                            </h4>
                            <ul className='list-disc list-inside text-base sm:text-lg text-gray-700 dark:text-gray-400'>
                              {popupInfo.details.unit_kompetensi.map((unit) => (
                                <li key={unit.id}>{unit.nama}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </Popup>
            </CustomMarker>
          ))}
        </MapContainer>
      </div>
      {screenSize === 'desktop' ? (
        <Sidebar onSelectSchool={handleSchoolClick} />
      ) : screenSize === 'mobile' ? (
        <BottomBar onSelectSchool={handleSchoolClick} />
      ) : (
        <Sidebar onSelectSchool={handleSchoolClick} />
      )}
    </div>
  );
};

export default HomePage;
