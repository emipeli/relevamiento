/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { tipoComedorOpciones } from "../config/tipoComerdor";
//import { toast } from "react-toastify";
import { useRelevamientoId } from "@/hooks/useRelevamientoId";
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

interface EspecificacionesComedor {
  disponibilidad: string;
  tipos_comedor?: string[]; // Aquí guardamos los nombres o questions
}

export default function Comedor({
  id,
  label,
  servicios,
  construccionId,
}: ServiciosReuProps) {
  const [responses, setResponses] = useState<
    Record<string, EspecificacionesComedor>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleResponseChange = (
    servicioId: string,
    field: "disponibilidad" | "ubicacion",
    value: string
  ) => {
    setResponses((prev) => ({
      ...prev,
      [servicioId]: { ...prev[servicioId], [field]: value },
    }));
  };

  const handleCheckboxChange = (servicioId: string, name: string) => {
    setResponses((prev) => {
      const current = prev[servicioId]?.tipos_comedor || [];
      const updated = current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name];

      return {
        ...prev,
        [servicioId]: {
          ...prev[servicioId],
          tipos_comedor: updated,
        },
      };
    });
  };

  const relevamientoId = useRelevamientoId();

  const handleGuardar = async () => {
    // Verificamos si hay al menos un servicio con algún dato (disponibilidad o tipos_comedor)
    const hayAlgunDato = servicios.some((servicio) => {
      const respuesta = responses[servicio.id];
      return (
        (respuesta?.disponibilidad && respuesta.disponibilidad.trim() !== "") ||
        (respuesta?.tipos_comedor && respuesta.tipos_comedor.length > 0)
      );
    });

    if (!hayAlgunDato) {
      toast.warning("Por favor completa al menos un dato para continuar");
      return;
    }

    // Construimos el payload con todos los servicios (aunque algunos tengan campos vacíos)
    const payload = {
      relevamiento_id: relevamientoId,
      costruccion_id: construccionId,
      servicios: servicios.map((servicio) => {
        const respuesta = responses[servicio.id] || {};
        return {
          servicio: servicio.question,
          disponibilidad: respuesta.disponibilidad || "",
          tipos_comedor: respuesta.tipos_comedor || [],
        };
      }),
    };
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/uso_comedor", {
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

    toast.success("Relevamiento uso comedor guardado correctamente");
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
      <table className="w-full border mt-2 text-xs">
        <thead>
          <tr className="bg-custom text-white">
            <th className="border p-2"></th>
            <th className="border p-2"></th>
            <th className="border p-2">Sí</th>
            <th className="border p-2">No</th>
            <th className="border p-2"></th>
          </tr>
        </thead>
        <tbody>
          {servicios.map(({ id, question, showCondition }) => (
            <tr key={id} className="border text-sm">
              <td className="border p-2 text-center">{id}</td>
              <td className="border p-2">{question}</td>
              {!showCondition ? (
                <>
                  <td className="border p-2 text-center">
                    <div className="grid grid-cols-3 gap-2">
                      {tipoComedorOpciones.map((opcion) => (
                        <label key={opcion.id} className="text-sm">
                          {opcion.prefijo}
                          <input
                            type="checkbox"
                            name={`disponibilidad-${id}`}
                            checked={
                              responses[id]?.tipos_comedor?.includes(
                                opcion.name
                              ) || false
                            }
                            onChange={() =>
                              handleCheckboxChange(id, opcion.name)
                            }
                            disabled={responses[id]?.disponibilidad === "No"} // 👈 desactiva si es No
                          />
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="border p-2 text-center text-xs bg-slate-200 text-slate-400">
                    <p>
                      A - En comedor B - SUM/patio cubierto/gimnasio C - En
                      aulas D - áreas de circulación E - Otro
                    </p>
                  </td>
                  <td className="border p-2 text-center text-xs bg-slate-200 text-slate-400">
                    <p>
                      El servicio se presta en aulas (C): pase al ítem 10.
                      Resto: al ítem 9.3
                    </p>
                  </td>
                </>
              ) : (
                <>
                  <td
                    className={`border p-2 text-center ${
                      !showCondition ? "bg-slate-200 text-slate-400" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`disponibilidad-${id}`}
                      value="Si"
                      onChange={() =>
                        handleResponseChange(id, "disponibilidad", "Si")
                      }
                    />
                  </td>
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
                  <td className="border p-2 text-center text-xs bg-slate-200 text-slate-400">
                    <p>
                      Si: Pase al ítem 9.2 y complete el cuadro. No: pase al
                      ítem 10
                    </p>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleGuardar}
                            disabled={isSubmitting}

          className="bg-custom hover:bg-custom/50 text-sm text-white font-bold p-2 rounded-lg"
        >
                    {isSubmitting ? "Guardando..." : "Guardar información"}

        </button>
      </div>
    </div>
  );
}
