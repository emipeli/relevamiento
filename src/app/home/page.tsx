/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CuiComponent from "@/components/Forms/dinamicForm/CuiComponent";
import Spinner from "@/components/ui/Spinner";
import { useUser } from "@/hooks/useUser";
import { InstitucionesData } from "@/interfaces/Instituciones";
import { Relevamiento } from "@/interfaces/Relevamiento";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { resetArchivos } from "@/redux/slices/archivoSlice";
import {
  setCui,
  setInstitucionId,
  setRelevamientoId,
} from "@/redux/slices/espacioEscolarSlice";
import { establecimientosService } from "@/services/Establecimientos/establecimientosService";
import { relevamientoService } from "@/services/relevamientoService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function HomePage() {
  const [cuiInputValue, setCuiInputValue] = useState<number | undefined>(
    undefined
  );
  const [instituciones, setInstituciones] = useState<InstitucionesData[]>([]);
  const [relevamientos, setRelevamientos] = useState<Relevamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        const data = await establecimientosService.getAllEstablecimientos();
        setInstituciones(data);
      } catch (error: any) {
        setError(error.message);
        console.error("Error fetching instituciones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstituciones();
  }, []);

  const handleCuiInputChange = (cui: number | undefined) => {
    setCuiInputValue(cui);
    dispatch(setInstitucionId());
    dispatch(setCui());
  };

  // Función para buscar relevamientos existentes por CUI
  const fetchRelevamientos = async () => {
    if (!cuiInputValue) return;

    try {
      const data = await relevamientoService.getRelevamientoByCui(
        cuiInputValue
      );

      if (!data || data.length === 0) {
        toast.info("No se encontraron relevamientos para este CUI.", {
          position: "top-right",
          autoClose: 3000,
        });
        setRelevamientos([]); // Limpia el estado si no hay resultados
        return;
      }

      setRelevamientos(data);
    } catch (error) {
      console.error("Error al obtener el relevamiento:", error);
      toast.error("Error al obtener el relevamiento", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleNuevoRelevamiento = async () => {
    if (!cuiInputValue || !user?.email) return;

    try {
      const data = await relevamientoService.createRelevamiento(
        cuiInputValue,
        user.email
      );

      // Acá accedés directamente a lo que devolvés en el endpoint
      const nuevoRelevamientoId = data.inserted.id;
      dispatch(resetArchivos());

      toast.success("Relevamiento creado correctamente");
      dispatch(setRelevamientoId(nuevoRelevamientoId));
      sessionStorage.setItem("relevamientoId", String(nuevoRelevamientoId));
      router.push("/espacios-escolares");
    } catch (error) {
      console.error("Error en la creación del relevamiento:", error);
      toast.error("Error al crear el relevamiento");
    }
  };

  const selectedInstitutionId = useAppSelector(
    (state) => state.institucion.institucionSeleccionada
  );

  const handleView = (relevamientoId: number) => {
    // Redirigir a la página de detalle con el id del relevamiento
    router.push(`/home/relevamiento/detalle/${relevamientoId}`);
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="h-full mt-8 overflow-hidden bg-white text-black text-sm">
      <div className="flex justify-center mt-20 mb-8 mx-4">
        <div className="flex flex-col items-center">
          <h1 className="font-bold text-custom">
            FORMULARIO GENERAL DE RELEVAMIENTO PEDAGÓGICO
          </h1>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center">
          <Spinner />
          Cargando Instituciones...{" "}
        </div>
      )}

      <CuiComponent
        label=""
        initialCui={cuiInputValue}
        onCuiInputChange={handleCuiInputChange}
        isReadOnly={false}
        sublabel=""
      />

      <button
        className="bg-custom hover:bg-custom/75 text-white rounded-md ml-10 px-4 py-2 mt-4 disabled:bg-gray-400 disabled:hover:bg-gray-400"
        disabled={!selectedInstitutionId}
        onClick={fetchRelevamientos} // Función para buscar los relevamientos
      >
        Buscar Relevamientos
      </button>

      <button
        className="bg-green-600 hover:bg-green-700 text-white rounded-md ml-10 px-4 py-2 mt-4 disabled:bg-gray-400 disabled:hover:bg-gray-400"
        disabled={!selectedInstitutionId}
        onClick={handleNuevoRelevamiento} // Función para crear un nuevo relevamiento
      >
        Nuevo Relevamiento
      </button>

      {/* Mostrar los relevamientos encontrados en una tabla */}
      {relevamientos.length > 0 && (
        <div className="mt-6 mx-10">
          <h3 className="font-bold">Relevamientos existentes</h3>
          <table className="min-w-full bg-white border border-rounded-lg border-gray-300 mt-4 text-sm text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 border-b">Fecha</th>
                <th className="px-4 py-2 border-b">ID Relevamiento</th>
                <th className="px-4 py-2 border-b">Cui</th>
                <th className="px-4 py-2 border-b">Usuario</th>
                <th className="px-4 py-2 border-b">Estado</th>
                <th className="px-4 py-2 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {relevamientos.map((relevamiento) => (
                <tr key={relevamiento.id}>
                  <th className="px-4 py-2 border-b">
                    {new Date(relevamiento.created_at).toLocaleDateString(
                      "es-ES"
                    )}
                  </th>
                  <td className="px-4 py-2 border-b">{relevamiento.id}</td>
                  <td className="px-4 py-2 border-b">{relevamiento.cui_id}</td>
                  <td className="px-4 py-2 border-b">
                    {relevamiento.created_by}
                  </td>
                  <td
                    className={
                      relevamiento.estado === "completo"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {relevamiento.estado === "completo"
                      ? "Completo"
                      : "Incompleto"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    <button
                      className="bg-custom hover:bg-custom/75 text-white rounded-md px-4 py-1 mr-2"
                      onClick={() => handleView(relevamiento.id)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
