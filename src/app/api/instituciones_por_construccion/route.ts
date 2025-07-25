/* eslint-disable @typescript-eslint/no-explicit-any */
import { getConnection } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const connection = await getConnection();
  const body = await req.json();

  const { relevamiento_id, construccion_id, instituciones } = body;

  if (!relevamiento_id || !construccion_id || !Array.isArray(instituciones)) {
    return NextResponse.json(
      { message: "Datos faltantes o incorrectos" },
      { status: 400 }
    );
  }

  try {
    // Borra las relaciones existentes primero (opcional)
    await connection.query(
      `DELETE FROM instituciones_por_construccion WHERE construccion_id = ?`,
      [construccion_id]
    );

    // Inserta nuevas relaciones
    for (const institucion_id of instituciones) {
      await connection.query(
        `INSERT INTO instituciones_por_construccion (
          relevamiento_id,
          construccion_id,
          institucion_id
        ) VALUES (?, ?, ?)`,
        [relevamiento_id, construccion_id, institucion_id]
      );
    }

    connection.release();
    return NextResponse.json({
      message: "Relaciones guardadas correctamente",
    });
  } catch (error: any) {
    console.error("Error al guardar relaciones:", error);
    connection.release();
    return NextResponse.json(
      { message: "Error interno", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const connection = await getConnection();

  const { searchParams } = new URL(req.url);
  const relevamiento_id = searchParams.get("relevamiento_id");
  const construccion_id = searchParams.get("construccion_id");

  if (!relevamiento_id || !construccion_id) {
    return NextResponse.json(
      { message: "Faltan parámetros relevamiento_id o construccion_id" },
      { status: 400 }
    );
  }

  try {
    const [rows] = await connection.query(
      `SELECT institucion_id FROM instituciones_por_construccion 
       WHERE relevamiento_id = ? AND construccion_id = ?`,
      [relevamiento_id, construccion_id]
    );

    connection.release();
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error al obtener instituciones:", error);
    connection.release();
    return NextResponse.json(
      { message: "Error interno", error: error.message },
      { status: 500 }
    );
  }
}
