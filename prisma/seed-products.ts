import { PrismaClient } from "@prisma/client";
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';


export async function seedProdcuts(csvPath: string) {
  const records: any[] = []
  const stream = createReadStream(csvPath, { encoding: 'utf-8' }).pipe(parse({
    delimiter: ',',
    trim: true,
    skip_empty_lines: true,
    from_line: 2, // Empieza a leer desde la segunda línea para saltar los encabezados
  }))

  // Procesar cada línea del CSV de forma asincrónica
  for await (const record of stream) {
    records.push(record)
  }

  console.log("records count", records.length)  
  
  for (const record of records) {
    try {
      const dataProduct = {
        externalId: record[0],  // Ranking
        code: record[1],        // Cod Articulo
        name: record[2],        // Articulo
        stock: parseInt(record[4]),  // En Stock
        pedidoEnOrigen: parseInt(record[5]),  // Pedido en Origen
        precioUSD: parseFloat(record[6].replace(',', '.')),  // Precio venta Publico USD
        categoryName: record[3],  // Familia
      }
      console.log(dataProduct);
      //await createOrUpdateProduct(dataProduct);
      const postUrl= "http://localhost:3000/api/cltc1dkoj01m1c7mpv5h3y00y/products/update"
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer t9EyqpztGjWNQnfOE8XRINAZe41pnuHJ'
        },
        body: JSON.stringify(dataProduct)
      })
      console.log(response)
    } catch (error) {
      console.log("Error processing record", record, error);
    }    
  }
}
