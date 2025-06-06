// components/Construcciones/LocalDetalleModal.tsx

"use client";

import { AreasExteriores } from "@/interfaces/AreaExterior";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface Props {
  area: AreasExteriores;
  onClose: () => void;
  isOpen: boolean;
}

export const AreaExternaDetalleModal = ({ area, onClose, isOpen }: Props) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-900 mb-4"
                >
                  Detalle del Local
                </Dialog.Title>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-800 border-t border-gray-200 pt-4">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="font-semibold">Tipo</span>
                    <span>{area.tipo}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="font-semibold">
                      Identificación en el plano
                    </span>
                    <span>{area.identificacion_plano}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="font-semibold">Terminación del piso</span>
                    <span>{area.terminacion_piso}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="font-semibold">
                      Estado de conservación
                    </span>
                    <span>{area.estado_conservacion} m²</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="font-semibold">Superficie</span>
                    <span>{area.superficie}m</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-custom hover:bg-custom/50 rounded-md"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
