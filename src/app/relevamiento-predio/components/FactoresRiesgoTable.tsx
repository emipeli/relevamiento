import { useRelevamientoId } from "@/hooks/useRelevamientoId";
import {
  Column,
  FactoresRiesgoAmbiental,
} from "@/interfaces/FactoresRiesgoAmbienta";
import { setFactores } from "@/redux/slices/serviciosFactoresSlice";
import React, { ChangeEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

interface FactoresRiesgoFormProps {
  serviciosData: FactoresRiesgoAmbiental[];
  columnsConfig: Column[];
}

const FactoresRiesgoTable: React.FC<FactoresRiesgoFormProps> = ({
  serviciosData,
  columnsConfig,
}) => {
  const [servicios, setServicios] =
    useState<FactoresRiesgoAmbiental[]>(serviciosData);
  const dispatch = useDispatch();

  const relevamientoId = useRelevamientoId();
    const [isSubmitting, setIsSubmitting] = useState(false);


  const handleChange = (
    index: number,
    field: keyof FactoresRiesgoAmbiental,
    value: string
  ) => {
    const updatedServicios = [...servicios];
    updatedServicios[index] = { ...updatedServicios[index], [field]: value };
    setServicios(updatedServicios);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Validar que al menos un campo (select o input) esté completo
  const alMenosUnCampoValido = servicios.some((servicio) =>
    columnsConfig.some((column) => {
      const value = servicio[column.key];
      return (
        (column.type === "select" || column.type === "input") &&
        typeof value === "string" &&
        value.trim() !== ""
      );
    })
  );

  if (!alMenosUnCampoValido) {
    toast.warning("Por favor, completá al menos un campo antes de continuar.");
    return; // Bloquea el envío
  }
  setIsSubmitting(true);
  const serviciosConRelevamiento = servicios.map((servicio) => ({
    ...servicio,
    relevamiento_id: relevamientoId,
  }));

  const response = await fetch("/api/servicios_factores_riesgo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(serviciosConRelevamiento),
  });

  if (response.ok) {
    dispatch(setFactores(serviciosConRelevamiento));
    toast.success("Servicios cargados correctamente!");
  } else {
    toast.error("Error al cargar los servicios.");
  }
  setIsSubmitting(false);
};



  return (
      <form onSubmit={handleSubmit} className="p-2 mx-10 mt-4 bg-white rounded-lg border shadow-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-custom text-white text-center"> 
              {columnsConfig.map((column) => (
                <th
                  key={column.key}
                  className={`border p-2 text-center ${
                    column.key === "id" ? "bg-custom text-white" : ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio, index) => (
              <tr key={servicio.id_servicio}>
                {columnsConfig.map((column) => (
                  <td
                    key={`${servicio.id}-${column.key}`}
                    className="border p-2 text-center"
                  >
                    {column.type === "select" && (
                      <select
                        value={servicio[column.key]}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          handleChange(index, column.key, e.target.value)
                        }
                        className="w-full p-2 border rounded"
                        disabled={
                          column.conditional && !column.conditional(servicio)
                        }
                      >
                        <option value="">Seleccionar</option>
                        {column.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {column.type === "input" && (
                      <input
                        type="text"
                        value={servicio[column.key]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleChange(index, column.key, e.target.value)
                        }
                        className="w-full p-2 border rounded"
                        disabled={
                          column.conditional && !column.conditional(servicio)
                        }
                      />
                    )}
                    {column.type === "text" && (
                      <div>{servicio[column.key]}</div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="text-sm font-bold bg-custom hover:bg-custom/50 text-white p-2 rounded-lg"
            disabled={isSubmitting}
          >
                      {isSubmitting ? "Guardando..." : "Guardar información"}

          </button>
        </div>
      </form>
  );
};

export default FactoresRiesgoTable;
