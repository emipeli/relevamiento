/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import NumericInput from "@/components/ui/NumericInput";
import { useRelevamientoId } from "@/hooks/useRelevamientoId";
import { useState } from "react";
import { toast } from "react-toastify";

interface Servicio {
  id: string;
  question: string;
  showCondition: boolean;
}

interface ServiciosReuProps {
  id: number;
  label: string;
  sub_id: number;
  sublabel: string;
  servicios: Servicio[];
  construccionId: number | null;
}

interface EspecificacionesAccesibilidad {
  id?: number;
  estado: string;
  cantidad_bocas: string;
}

export default function CondicionesAccesibilidad({
  id,
  label,
  sub_id,
  sublabel,
  servicios,
  construccionId,
}: ServiciosReuProps) {
  const [responses, setResponses] = useState<
    Record<
      string,
      {
        disponibilidad: string;
        estado: string;
        cantidad: string;
        mantenimiento: string;
      }
    >
  >({});

  const relevamientoId = useRelevamientoId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResponseChange = (
    servicioId: string,
    field: "disponibilidad" | "estado" | "cantidad" | "mantenimiento",
    value: string
  ) => {
    setResponses((prev) => ({
      ...prev,
      [servicioId]: { ...prev[servicioId], [field]: value },
    }));
  };

  const [cantidadOptions, setCantidadOptions] = useState<{
    [key: string]: number; // Cambiado para ser string porque los IDs de los servicios son strings
  }>({});

  const handleGuardar = async () => {
    // Filtrar solo servicios que tengan datos válidos
    const serviciosValidos = Object.keys(responses).filter((key) => {
      const r = responses[key];
      const cantidad = cantidadOptions[key] ?? 0;

      return (
        (r?.disponibilidad && r.disponibilidad.trim() !== "") ||
        (r?.estado && r.estado.trim() !== "") ||
        cantidad > 0 ||
        (r?.mantenimiento && r.mantenimiento.trim() !== "")
      );
    });

    if (serviciosValidos.length === 0) {
      toast.warning(
        "Debe completar al menos un servicio con datos antes de guardar"
      );
      return;
    }

    const payload = {
      relevamiento_id: relevamientoId,
      construccion_id: construccionId,
      servicios: serviciosValidos.map((key) => ({
        servicio:
          servicios.find((servicio) => servicio.id === key)?.question ||
          "Unknown",
        disponibilidad: responses[key]?.disponibilidad || "",
        estado: responses[key]?.estado || "",
        cantidad: cantidadOptions[key] || 0,
        mantenimiento: responses[key]?.mantenimiento || "",
      })),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/condiciones_accesibilidad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al guardar los datos");
      }

      toast.success(
        "Relevamiento condiciones accesibilidad guardados correctamente"
      );
    } catch (error: any) {
      console.error("Error al enviar los datos:", error);
      toast.error(error.message || "Error al guardar los datos");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mx-10 mt-2 p-2 border rounded-2xl shadow-lg bg-white text-sm">
      {id !== 0 && (
        <div className="flex items-center gap-2 mt-2 p-2 border rounded-2xl shadow-lg bg-white text-black">
          <div className="w-8 h-8 rounded-full flex justify-center items-center text-white bg-custom">
            <p>{id}</p>
          </div>
          <div className="h-6 flex items-center justify-center">
            <p className="px-2 text-sm font-bold">{label}</p>
          </div>
        </div>
      )}
      {sub_id !== id && (
        <div className="flex items-center gap-2 mt-2 p-2 border rounded-2xl shadow-lg bg-white text-black">
          <div className="w-6 h-6 flex justify-center text-black font-bold">
            <p>{sub_id}</p>
          </div>
          <div className="h-6 flex items-center justify-center ">
            <p className="px-2 text-sm font-bold">{sublabel}</p>
          </div>
        </div>
      )}

      <table className="w-full border mt-2 text-xs">
        <thead>
          <tr className="bg-custom text-white">
            <th className="border p-2"></th>
            <th className="border p-2">TIPO DE PROVISIÓN</th>
            <th className="border p-2">No</th>
            <th className="border p-2">Sí</th>
            <th className="border p-2">Estado y especificaciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map(({ id, question, showCondition }) => (
            <tr key={id} className="border text-sm">
              <td className="border p-2 text-center">{id}</td>
              <td className="border p-2">{question}</td>
              <td className="border p-2 text-center">
                <input
                  type="radio"
                  name={`disponibilidad-${id}`}
                  value="No"
                  onChange={() =>
                    handleResponseChange(id, "disponibilidad", "No")
                  }
                />
              </td>
              <td className="border p-2 text-center">
                <input
                  type="radio"
                  name={`disponibilidad-${id}`}
                  value="Si"
                  onChange={() =>
                    handleResponseChange(id, "disponibilidad", "Si")
                  }
                />
              </td>

              {/* Especificaciones */}
              <td
                className={`border p-2 text-center ${
                  !showCondition ? "bg-slate-200 text-slate-400" : ""
                }`}
              >
                {!showCondition ? (
                  "No corresponde"
                ) : (
                  <div className="flex gap-2 items-center justify-center">
                    {/* Radios B, R, M */}
                    <div className="flex gap-2 items-center justify-center">
                      <label>
                        <input
                          type="radio"
                          name={`estado-${id}`}
                          value="Bueno"
                          onChange={() =>
                            handleResponseChange(id, "estado", "Bueno")
                          }
                          className="mr-1"
                        />
                        B
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`estado-${id}`}
                          value="Regular"
                          onChange={() =>
                            handleResponseChange(id, "estado", "Regular")
                          }
                          className="mr-1"
                        />
                        R
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`estado-${id}`}
                          value="Malo"
                          onChange={() =>
                            handleResponseChange(id, "estado", "Malo")
                          }
                          className="mr-1"
                        />
                        M
                      </label>
                    </div>

                    {/* TextInput para 8.1, 8.2, 8.3 */}
                    {(id === "8.1" || id === "8.2" || id === "8.3") && (
                      <div className="flex gap-2 items-center justify-center">
                        <p className="text-xs font-bold">Cantidad</p>
                        <NumericInput
                          disabled={false}
                          label=""
                          subLabel=""
                          value={cantidadOptions[id] || 0}
                          onChange={(value: number | undefined) => {
                            setCantidadOptions({
                              ...cantidadOptions,
                              [id]: value ?? 0,
                            });
                          }}
                        />
                      </div>
                    )}
                    {/* TextInput para 8.1, 8.2, 8.3 */}
                    {(id === "8.1" || id === "8.2") && (
                      <div className="flex gap-2 items-center justify-center">
                        <p className="text-xs font-bold">
                          ¿Se realiza mantenimiento?
                        </p>
                        <label>
                          <input
                            type="radio"
                            name={`mantenimiento-${id}-8.3`}
                            value="No"
                            onChange={() =>
                              handleResponseChange(id, "mantenimiento", "No")
                            }
                            className="mr-1"
                          />
                          No
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`mantenimiento-${id}`}
                            value="Malo"
                            onChange={() =>
                              handleResponseChange(id, "mantenimiento", "Si")
                            }
                            className="mr-1"
                          />
                          Si
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={isSubmitting}
          className="bg-custom hover:bg-custom/50 text-white text-sm font-bold px-4 py-2 rounded-md"
        >
          {isSubmitting ? "Guardando..." : "Guardar información"}
        </button>
      </div>
    </div>
  );
}
